
## Previous

[03 - Add some mock tests](https://github.com/full-stack-hackers/digoc-cicd-node/blob/03-testing/GUIDE.md)

## Automation

Now that we have tests, let's automate them! Automating our tests means we will have constant regression checks. Every time our code gets pushed to github, our tests will automatically be run, and we can see the status of those tests on github as well as on our CI/CD tool.

## CirlceCI

The CI/CD tool we will use is CircleCI. CircleCI is a de-facto solution for CI/CD. Let's set it up.

If you don't have an account, just go to https://circleci.com/signup/ and "Sign Up with Github". This will prompt you through the project, and once you are done you are ready to add circleci to any project, simply by adding the configuration file.

## .circlci/config.yml

In order for CircleCI to recognize that it needs to do something with our project, we will add a special folder called `.circlci`. In that folder we will create a command/config file called `config.yml`. `.yml` files have a declarative and simple syntax. Each tool that uses them has their own special rules for available commands to use. CircleCI is no different. Here you will see a few simple options available to us. For more on `.yml` files, check out [here](https://en.wikipedia.org/wiki/YAML), and for more on CircleCI's yaml options, check out [here](https://circleci.com/docs/2.0/configuration-reference/). 

For now, just copy and paste the following into your `.circleci/config.yml`: (Be aware this `.circleci/` folder is in the root of your project, not your `node-server/`)

```yaml
version: 2
jobs:
  build:
    docker:
      - image: circleci/node:12.6

    working_directory: ~/node-server

    steps:
      - checkout

      # Download and cache dependencies
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package.json" }}
            # fallback to using the latest cache if no exact match is found
            - v1-dependencies-

      - run:
        name: install dependencies
        command: npm install

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}

      - run:
        name: run tests
        command: npm test
```

This script will tell CircleCI which version of node to use, install our dependencies (with caching), and then run our tests. Save, and push your code to github to see what it looks like!

## Next

[05 - Deploy on Digital Ocean](https://github.com/full-stack-hackers/digoc-cicd-node/blob/05-deploy/GUIDE.md)
