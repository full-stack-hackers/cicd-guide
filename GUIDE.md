# Continuous Deployment

Almost there! Lets automate that deployment for you!

## Previous

[05 - Deploy on Digital Ocean](https://github.com/full-stack-hackers/cicd-guide/blob/05-deploy/GUIDE.md)

## Server SSH User

The idea here is that we will do exactly what we just did, but automated. We will ssh into our server, pull the changes (after successful CircleCI tests) and, start our server. In order to do so, we need a SSH user on our server. So let's log into the console and do that.

> Do not just use your root user. Use another existing user, or follow along to create one

Either load the console, or ssh into the server as root. Then run

```bash
adduser circleci_guy
```

This will prompt you to set the new user's passphrase, as well as other info. Next, we need to give this new user `sudo` privileges. 

```bash
usermod -aG sudo circleci_guy
```

## Generate SSH Keys

Now that we have this user, CircleCI will need SSH keys to work with it, since it cannot enter a password. SSH in as your new user on CircleCI and create your keys with:

```bash
ssh-keygen -m PEM -t rsa -f ~/.ssh/id_rsa_circleci -C "circleci"
```

When it prompts you for a passphrase, do not enter one. Just press enter. **CircleCI cannot use password encrypted SSH Keys**

Notice now if you `ls ~/.ssh`, you will have

```bash
id_rsa_circleci  id_rsa_circleci.pub
```

The first file has your **private key**, and the second one has your **public key**, hence the `.pub` extension. The public key needs to be added to a `~/.ssh/authorized_users` file, so if you don't have one already, run

```bash
touch ~/.ssh/authorized_keys
```

Then copy your public key here by appending it with the `cat` command.

```bash
cat ~/.ssh/id_rsa_circleci.pub >> ~/.ssh/authorized_keys
```

Now, `cat` out the private key and highlight and copy it. Hold on to this, we will need it to add to CircleCI

```bash
cat ~/.ssh/id_rsa_circleci
```

Last thing you will need to do is enable your new user to run a server on PORT 80, which is a protected port. Run the following:

```bash
sudo setcap 'cap_net_bind_service=+ep' /usr/bin/node
```

## Store Private Key 

Head on over to CircleCI and naviagte to your project settings. Go to SSH Permissions. Click "Add SSH Key", and paste the private key you copied into the large box. If you have no other keys, you are fine to leave the hostname field empty.

![image](https://user-images.githubusercontent.com/31779571/70587331-aa561000-1b97-11ea-8ae0-266bd6a810d6.png)

## Add deploy step to `.circleci/config.yml`

As a final run step add the following to your config file:

```yaml
- run:
    name: deploy
    command: |
      ssh -o "StrictHostKeyChecking no" circleci_guy@167.71.240.12 "cd ~/app/node-server; git pull; npm i; npm start"
```

## PM2

This works, however, our CirclCI build will just stay connected to Digital Ocean. I am sure there are many ways around this, but I used PM2, which is built into the Node droplet. All we need to do is move our `.sample-env` and `.env` to the root of `node-server`, and add a config file for PM2 in the root of `node-server`.

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

Then change our deploy script to now use PM2:

```yaml
- run:
    name: deploy
    command: |
      ssh -o "StrictHostKeyChecking no" circleci_guy@167.71.240.12 "cd ~/app/node-server; git pull; npm i; pm2 start pm2.config.js"
```

Then, commit and push. And if all goes well, you should see your tests run and your app get deployed to your Digital Ocean droplet automatically. Congratualations on getting CI/CD set up for your project!