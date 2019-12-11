
## Previous

[04 - Continuous Integration with CircleCI](https://github.com/full-stack-hackers/cicd-guide/blob/04-circleci/GUIDE.md)

## Deployment

You have an amazing app, but how do you show it off? You will need to host it somewhere! These days you have many options, but one of the easiest and cheapest is Digital Ocean. It is what we will use here. Go ahead and sign up for an account (I just sign up with GitHub), create a project, and create a droplet and add it to that project. For example, I will create a project called full-stack-hackers, and a droplet called cicd-demo.

When creating your droplet, it might help to select the NodeJS pre-configured droplet. It will come with Node, npm, and PM2, a process manager for node application.

## Deploy 

Now that you have your droplet running, go to the access tab and click on launch console. 

> You can also ssh using your own terminal if you wish

Once you are in, go ahead and clone your repo

```bash
git clone https://github.com/full-stack-hackers/cicd-guide
```

Next, fill in your environment variables. **Make sure to use PORT="80", as this is the default port DigitalOcean uses". Navigate into your `conf/` folder, and copy the `.sample-env`, then open it in vim and fill in the appropriate values. Now you can go into your project and run your app.

```bash
cd cicd-guide
cd node-server
npm install
npm start
```

This will run your server. You can now use your IP address:port given to you by Digital Ocean to access it!

## DNS domain naming

That IP address and port may not be too exciting, but you can easily use a custom domain with it! Digital Ocean can manage your DNS for you, if you point your nameservers at theirs.

```text
ns1.digitalocean.com
ns2.digitalocean.com
ns3.digitalocean.com
```

Then you can create a domain in Digital Ocean, and add it to your project. You can then manage it, and point it to the IP address of your droplet. I pointed my domain, `cicd-demo.full-stack-hackers.dev` -> `64.225.0.240`.

Now you should be able to access your app at your custom domain! I'm sure that was a lot of work and possibly frustration though, so the next step will be to automate the deployment as well!

## Next

[06 - Continuous Deployment](https://github.com/full-stack-hackers/cicd-guide/blob/06-continuous-deployment/GUIDE.md)