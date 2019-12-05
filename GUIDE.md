
## Previous

[01 - Set up repo](https://github.com/full-stack-hackers/digoc-cicd-node/blob/01-setup/GUIDE.md)

## Express-Generator

It is not difficult to build your own express app and if you wish to do so, roughly follow these steps:

* run `npm init` in your project
* add your `app.js` and add express to the file
* add some route handlers, and optionally set up a view engine and serve up rendered files
* set the app to listen on a port
* run your app

If you want a quicker way to do all this, with accepted best practices, follow along here instead.

First you will want to install [`express-generator`](https://expressjs.com/en/starter/generator.html). Run 

```bash
npm i -g express-generator
```

Once that is installed, you can run `express -h` to see all the options available to you. I will run 

```bash
express --view=pug node-server
```

## Run the app

## Next

[03 - Add some mock tests](https://github.com/full-stack-hackers/digoc-cicd-node/blob/03-testing/GUIDE.md)
