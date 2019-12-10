# Add some tests

## Previous

[02 - Generate Express App](https://github.com/full-stack-hackers/digoc-cicd-node/blob/02-express/GUIDE.md)

## Why Tests?

Testing is important to every real project. And while this is no real-world project, it is good to get in the habit of writing and running tests. Also, this will give us a chance to practice
our continuous integration. Most developers think of automated testing and building when they think of continuous integration. So that is exactly what we are going to do. Feel free to add 
as many tests as you like, but we will keep it simple to move on to the meat of this project.

## Adding Tests

To run our tests, we are going to use the oh-so-popular [`mocha`](https://mochajs.org/) library. Let's go ahead and start by installing it as a dev dependency for our project. 

```bash
npm i --save-dev mocha
```

Next, in the root of our `node-server`, we will create a `test/` directory.

```bash
mkdir test
```

And in that folder, create a `test.js` file.

```bash
touch test.js
```

Now we can add a classical example of a test, just to **test** (haha) that `mocha` is working. In `test.js`, paste in:

```javascript
var assert = require('assert');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});
```

Now in our `package.json`, we will add a new script:

```json
"test": "mocha"
```

Now back in our terminal we can run `npm test`, and see our tests pass.

## Real API Tests

Now that we have mocha set up and some demo tests running successfully, let's add some real tests to our server. For this, we will add two more libraries. We already know that `mocha`
allows us to run automated tests, but unless we want to manually write convoluted `assert()` statements the whole time, we will want an *assertion* library. This is where `chai` comes in.
`Chai` works well with mocha, allowing mocha to run the tests, and use `chai`'s assertions to evaluate whether those tests pass or fail. We will also use `chai-http`, which will allow us to 
execute assertions on HTTP requests, which is perfect for our purposes.

```bash
npm i --save-dev chai chai-http
```

Once we have those libraries installed, we are going to use them. Go ahead and get rid of what is in `test.js`, and add:

```javascript
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');

const should = chai.should();
chai.use(chaiHttp)

describe('API Tests', () => {
  describe('/GET index route', () => {
    it('Should return successfully', (done) => {
      chai.request(server).get('/').end((err, res) => {
        res.should.have.status(200);
        done();
      })
    });
  });
});
```

This imports `chai` and `chai-http`, and then brings in our application as the server const. We then instruct chai to use the Chai HTTP plugin and get a reference to chai's `should` function. 
We then setup a structure for our tests and run a single, simple test to ensure that the response status from our index route is `200 OK`.

Great, we should now be able to run `npm test` again, and see our tests run successfully. The next step is to automate them with continuous integration on CircleCI!

## Next

[04 - CircleCI](https://github.com/full-stack-hackers/digoc-cicd-node/blob/04-circleci/GUIDE.md)
