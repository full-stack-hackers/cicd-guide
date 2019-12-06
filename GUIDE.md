# Generate Express App

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

Next you will follow the instructions the generator outputs for you. `cd node-server`, and `npm install`. This will take a bit while node installs dependencies for our app.

Now you could run the app with the the command they recommend, `DEBUG=node-server:* npm start`, but we are going to quickly use a couple best practices. We are going to add `.env` files, `.gitignore`, use nodemon, and optionally, easy-log for nice console logging.

## Configuration

Start by running

```bash
npm i nodemon dotenv easy-log
```

I also like to remove the modules I don't use. You can do this as well if you like.

```bash
npm uninstall morgan
```

> Remember to remove any references to `morgan` or any other modules you remove.

Next, create your `conf/` folder in the root of your project. Then add a `.env`, `.sample-env`, `loggers.js`, and optionally a `routes.js` file. I like to have file for all my routes, and delegate everything else to controllers. We'll do this in a second.

In your `.env` file and your `.sample-env` file, add the following:

```bash
DEBUG="app:*"
PORT="8081"
```

Also add any other environment variables you would like. Remember if the env variable is secret, only add it to `.env`, as we will not commit this publically. We will leave a blank env in the `.sample-env` file for collaborating developers to fill in for themselves. For example, if we were to add a database password, in our `.env` file we would add 

```bash
DB_PASSWORD="supersecurepassword"
```

And in the `.sample-env`, we would add

```bash
DB_PASSWORD=
```

Other developers just need to now fill in the `.sample-env` file when they clone the project, and save it as `.env` for themselves. 

In order to make this flow work though, be sure to create a `.gitignore` in the root of your project, and add `.env` to it. Also add `node_modules` and `.DS_Store` while you are at it.

Now that our configuration is set up, let's add a run script and test it out. In `package.js`, delete the `start` script, and add our own:

```json
"start": "nodemon -r dotenv/config bin/www dotenv_config_path=conf/.env"
```

If everything runs with no errors, congratulations! Now if you removed `morgan`, or want to do additional opinionated setup, keep following to set up our own loggers and routes file.

## Loggers

First, let's get those loggers set up. If you did not already, go ahead and run `npm i easy-log`. Next, in the `conf/loggers.js` file, lets import `easy-log` as a logger factory and create some loggers.

```javascript
const loggerFactory = require('easy-log')

module.exports.debugLog = loggerFactory('app:debug')
module.exports.serverLog = loggerFactory('app:server')

module.exports.requestLog = (req, res, next) => {
  let log = `${req.method} - ${req.originalUrl}`
  loggerFactory('app:request', { colorCode: 226 })(log)
  return next()
}
```

Next, we will use it in the `bin/www` file (if you removed the existing `debug`. Now we will import our `serverLog` function

```javascript
const { serverLog } = require('../conf/loggers');
```

And use it in the `onListening()` handler at the bottom

```javascript
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
    serverLog(`App running on ${bind}`)
}
```

Let's also add the requestLog to our app. In `app.js`, import the logger

```javascript
const { requestLog } = require('./conf/loggers');
```

and use it

```javascript
app.use(requestLog)
```

Now if you run the app with `npm start`, and go to http://localhost:8081/ (or whatever your port was, you should see

![image](https://user-images.githubusercontent.com/31779571/70282097-e13cb800-178a-11ea-9386-2695589902c4.png)

in the browser and 

![image](https://user-images.githubusercontent.com/31779571/70282131-fc0f2c80-178a-11ea-9711-fc040a62e36d.png)

in the console. Congrats again! Next, I am going to make one last change. I will move my functionality to controllers and my routes to `conf/routes.js`. This is purely my preference.

## Routes.js

First I move all the routes in files in `routes/` to one file in `conf/routes.js`

```javascript
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET users listing. */
router.get('/users', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
```

Then I rename `routes/` to `controllers/` and `index.js` to `home.js`. I then strip out the routes parts and make them pure controllers.

**home.js**
```javascript
module.exports.renderIndexPage = function(req, res, next) {
  res.render('index', { title: 'Express' });
}
```

**users.js**
```javascript
module.exports.getAllUsers = function(req, res, next) {
  res.send('respond with a resource');
}
```

Finally, I export them from the `controllers/index.js` file.

**controllers/index.js**
```javascript
module.exports.home = require('./home');
module.exports.users = require('./users');
```

Then back in the `conf/routes`, we import and use the controllers in place of the inline functions.

**conf/routes.js**
```javascript
var express = require('express');
var router = express.Router();
const controllers = require('../controllers');

/* GET home page. */
router.get('/', controllers.home.renderIndexPage);

/* GET users listing. */
router.get('/users', controllers.users.getAllUsers);

module.exports = router;
```

Lastly, we use this new routes file instead of the individual ones in `app.js`

**app.js**
```javascript
const routes = require('./conf/routes');

...

app.use('/', routes);
```

Notice we now delegate all route mapping in the actual `conf/routes.js` file, not by sub-routers in the `app.js` file. This now means you can go to one place and see the complete version of every available route.

That's it! See you in the next guide where we will add some tests.

## Next

[03 - Add some mock tests](https://github.com/full-stack-hackers/digoc-cicd-node/blob/03-testing/GUIDE.md)
