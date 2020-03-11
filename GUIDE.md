
## Previous

[04 - Continuous Integration with CircleCI](https://github.com/full-stack-hackers/cicd-guide/blob/04-circleci/GUIDE.md)

## HTTPS

> If you need to server over https, for example, using a `.dev` domain, we will need to set up nginx as a reverse proxy for your node app. Much of the following tutorial is a modified and updated version of https://lengstorf.com/deploy-nodejs-ssl-digitalocean/

## Deployment

You have an amazing app, but how do you show it off? You will need to host it somewhere! These days you have many options, but one of the easiest and cheapest is Digital Ocean. It is what we will use here. Go ahead and sign up for an account (I just sign up with GitHub), create a project, and create a droplet and add it to that project. For example, I will create a project called full-stack-hackers, and a droplet called cicd-demo.

When creating the droplet, create the default ubuntu one, and select the cheapest one ($5/month). I also opt to use ssh, but you don't have to do this. If you want to, just copy your `~/.ssh/id_rsa.pub` file and add it to DigitalOcean and to your droplet when creating it.

## DNS domain naming

That IP address and port may not be too exciting, but you can easily use a custom domain with it! Digital Ocean can manage your DNS for you, if you point your nameservers at theirs.

```text
ns1.digitalocean.com
ns2.digitalocean.com
ns3.digitalocean.com
```

Then you can create a domain in Digital Ocean, and add it to your project. You can then manage it, and point it to the IP address of your droplet. I pointed my domain, `cicd-demo.full-stack-hackers.dev` -> `64.225.0.240`.

Check the mapping worked

```
dig +short cicd-demo.full-stack-hackers.dev
```

## Firewall

Now that you have your droplet running, go to the access tab and click on launch console. 

> You can also ssh using your own terminal if you wish

Next we need to set up the firewall. We want to allow ssh, http, and https traffic.

```
sudo ufw allow OpenSSH
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

## NodeJS

Our app is written in Node. To get NodeJS on this droplet, we will use [nodesource](https://github.com/nodesource/distributions#debinstall) to manage it, and use [nodejs Releases](https://github.com/nodejs/Release) to check the best version for us to get. As of this writing the current LTS version is 12.x.

To use nodesource: 

```
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
```

Now install nodejs

```
sudo apt-get install nodejs
```

## Deploy 

Now we need to clone in our app

```bash
git clone https://github.com/full-stack-hackers/cicd-guide
```

Next, fill in your environment variables. **Take note of what port you use, as it is what we will need to redirect our proxy later**. Navigate into your `conf/` folder, and copy the `.sample-env`, then open it in vim and fill in the appropriate values. Now you can go into your project and run your app.

```bash
cd cicd-guide
cd node-server
npm install
npm start
```
## PM2

This works, however, the app is running in the foreground. 

Install pm2

```
npm i -g pm2
```

Now all we need to do is move our `.sample-env` and `.env` to the root of `node-server`, and add a config file for PM2 in the root of `node-server`.

**pm2.config.js**
```javascript
module.exports = {
  apps : [{
    name      : 'CICD Demo',
    script    : './bin/www',
    node_args : '-r dotenv/config',
  }],
}
```

Now run it with 

```
pm2 start pm2.config.js
```

Check it is running with 

```
pm2 status
``` 

or 

```
pm2 logs
```

We can also make sure it restarts if the droplet restarts by running

```
pm2 startup systemd
```

and copy-paste the command it gives you.

## HTTPS Encryption

We will use lets encrypt

```
sudo apt-get install bc
sudo git clone https://github.com/letsencrypt/letsencrypt /opt/letsencrypt
```

Generate the certificate. Run

```
cd /opt/letsencrypt
./certbot-auto certonly --standalone
```

and follow the prompts.

Lets make it renew automatically

```
sudo crontab -e
```

Paste in

```
00 1 * * 1 /opt/letsencrypt/certbot-auto renew >> /var/log/letsencrypt-renewal.log
30 1 * * 1 /bin/systemctl reload nginx
```

## Nginx (Engine-X)

Now we will set up the Nginx server, which will forward all traffic to our server app

```
sudo apt-get install nginx
```

Next we want to redirect http traffic to https.

```
sudo vim /etc/nginx/sites-enabled/default
```

Paste in: 

```
# HTTP — redirect all traffic to HTTPS
server {
    listen 80;
    listen [::]:80 default_server ipv6only=on;
    return 301 https://$host$request_uri;
}
```

> It only takes a couple extra minutes to create a really secure SSL setup, so we might as well do it. One of the ways to do that is to use a strong Diffie-Hellman group, which helps ensure that our secure app stays secure.
> 
> Run the following command on your server:
> 
> ```
> sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048
> ```

Config our ssl:

```
sudo vim /etc/nginx/snippets/ssl-params.conf
```

Paste in:

```
# See https://cipherli.st/ for details on this configuration
ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_prefer_server_ciphers on;
ssl_ciphers "EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH";
ssl_ecdh_curve secp384r1; # Requires nginx >= 1.1.0
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off; # Requires nginx >= 1.5.9
ssl_stapling on; # Requires nginx >= 1.3.7
ssl_stapling_verify on; # Requires nginx => 1.3.7
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
# Add our strong Diffie-Hellman group
ssl_dhparam /etc/ssl/certs/dhparam.pem;
```

Enable our ssl:

```
sudo vim /etc/nginx/sites-enabled/default
```

Paste in:

```
# HTTPS — proxy all requests to the Node app
server {
    # Enable HTTP/2
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.example.com;
    # Use the Let’s Encrypt certificates
    ssl_certificate /etc/letsencrypt/live/app.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;
    # Include the SSL configuration from cipherli.st
    include snippets/ssl-params.conf;
    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-NginX-Proxy true;
        proxy_pass http://localhost:5000/;
        proxy_ssl_session_reuse off;
        proxy_set_header Host $http_host;
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
    }
}
```

Changing all app.example.com to your own domain

Test all the changes are correct

```
sudo nginx -t
```

It should indicate everything is fine, if not fix that.

Start the nginx server with

```
sudo systemctl start nginx
sudo systemctl restart nginx
```

Go to your domain and and test it worked!

## Next

[06 - Continuous Deployment](https://github.com/full-stack-hackers/cicd-guide/blob/06-continuous-deployment/GUIDE.md)
