# PPF API server

## Features

 - No transpilers, just vanilla javascript
 - ES2017 latest features like Async/Await
 - CORS enabled
 - Uses [yarn](https://yarnpkg.com)
 - Express + MongoDB ([Mongoose](http://mongoosejs.com/))
 - Consistent coding styles with [editorconfig](http://editorconfig.org)
 - [Docker](https://www.docker.com/) support
 - Uses [helmet](https://github.com/helmetjs/helmet) to set some HTTP headers for security
 - Load environment variables from .env files with [dotenv](https://github.com/rolodato/dotenv-safe)
 - Request validation with [joi](https://github.com/hapijs/joi)
 - Gzip compression with [compression](https://github.com/expressjs/compression)
 - Linting with [eslint](http://eslint.org)
 - Tests with [mocha](https://mochajs.org), [chai](http://chaijs.com) and [sinon](http://sinonjs.org)
 - Code coverage with [istanbul](https://istanbul.js.org) and [coveralls](https://coveralls.io)
 - Git hooks with [husky](https://github.com/typicode/husky) 
 - Logging with [morgan](https://github.com/expressjs/morgan)
 - Authentication and Authorization with [passport](http://passportjs.org)
 - API documentation generation with [apidoc](http://apidocjs.com)
 - Continuous integration support with [travisCI](https://travis-ci.org)
 - Monitoring with [pm2](https://github.com/Unitech/pm2)

## Requirements

 - [Node v7.6+](https://nodejs.org/en/download/current/) or [Docker](https://www.docker.com/)
 - [Yarn](https://yarnpkg.com/en/docs/install)

## Using local mongodb

Download mongodb server 5.0 from https://www.mongodb.com/try/download using type as `On-premises MongoDB local`

Install MongoDB

Create folder `c:/data/db`. This is where MongDB data will be stored.

Open command prompt and go to `C:\Program Files\MongoDB\Server\5.0\bin`

Start MongoDB server
```
mongod.exe
```

Open new command prompt and run mongo client to connnet to server
```
mongo.exe
```

Execute following commands to create ppf database and users
```
use ppf

db.createUser(
  {
    user: "mongoadmin",
    pwd: "secret",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  }
)

db.createUser(
  {
    user: "mongoroot",
    pwd: "secret",
    roles: [ { role: "root", db: "admin" } ]
  }
)

db.createUser(
  {
    user: "ppfadmin",
    pwd: "secret",
    roles: [ { role: "readWrite", db: "ppf" } ]
  }
)
```

## Use Auth0 for API security

Go to https://auth0.com/ and register for a free developer account

Go to Applications -> APIs and click on 'Create API'

Provide following parameters and click on 'Create'
  Name: PPF
  Identifier: http://ppf
  Signing algorithm: RS256

Go to 'PPF' API and select `Test` tab

From the cURL, extract domain as follows

curl --request POST \
  --url https://`jaydeepva.auth0.com`/oauth/token \
  --header 'content-type: application/json' \
  --data '{"client_id":"redacted","client_secret":"redacted","audience":"http://ppf","grant_type":"client_credentials"}

Add following properties to `.env` file

```
AUTH0_DOMAIN=<domain extracted above>
AUTH0_AUDIENCE=<identifer provided while creating API>
NODE_TLS_REJECT_UNAUTHORIZED=0
```

`NODE_TLS_REJECT_UNAUTHORIZED` is set to `0` to skip certification validation for development purpose

To test API

1. Get access token from Auth0. You can use the cURL command shown on Auth0 UI

2. Pass access token in the authorization header as `authorization: Bearer <token>`

## Getting Started

### Install dependencies:

```bash
yarn
```

### Set environment variables:

```bash
cp .env.example .env
```

Update .env file with mongodb information

```
MONGO_URI=mongodb://mongoadmin:secret@localhost:27017/ppf?authSource=admin
MONGO_URI_TESTS=mongodb://ppfadmin:secret@localhost:27017/ppftests?authSource=admin
```

To use jenkins as engine, update following variables. See ppf_provisioning\README.md for jenkins setup information

```
JENKINS_TOKEN_NAME=ppf-token
JENKINS_USER_NAME=admin
JENKINS_USER_TOKEN=11caaaa0a19ac54bdea5b107ae50ad5a3a
JENKINS_URL=http://localhost:8080
JENKINS_JOB_NAME=ppf-deploy-pipeline
```

## Running Locally

```bash
yarn dev
```

## Running in Production

```bash
yarn start
```

## Lint

```bash
# lint code with ESLint
yarn lint

# try to fix ESLint errors
yarn lint:fix

# lint and watch for changes
yarn lint:watch
```

## Test

```bash
# run all tests with Mocha
yarn test

# run unit tests
yarn test:unit

# run engine tests
yarn test:engine

# run db tests
yarn test:db

# run integration tests
yarn test:integration

# run all tests and watch for changes
yarn test:watch

# open nyc test coverage reports
yarn coverage
```

## Validate

```bash
# run lint and tests
yarn validate
```

## Logs

```bash
# show logs in production
pm2 logs
```

## Documentation

```bash
# generate and open api documentation
yarn docs
```

## Docker

```bash
# run container locally
yarn docker:dev

# run container in production
yarn docker:prod

# run tests
yarn docker:test
```

## Deploy

Set your server ip:

```bash
DEPLOY_SERVER=127.0.0.1
```

Replace my Docker username with yours:

```bash
nano deploy.sh
```

Run deploy script:

```bash
yarn deploy
```

## Tutorials
 - [Create API Documentation Using Squarespace](https://selfaware.blog/home/2018/6/23/api-documentation)

## License

[MIT License](README.md) - [Daniel Sousa](https://github.com/danielfsousa)
