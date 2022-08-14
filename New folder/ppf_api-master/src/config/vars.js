const path = require('path');

// import .env variables
require('dotenv-safe').config({
  path: path.join(__dirname, '../../.env'),
  example: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  db: {
    provider: 'mongodb',
    uri: process.env.NODE_ENV === 'test' ? process.env.MONGO_URI_TESTS : process.env.MONGO_URI,
  },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  emailConfig: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
  },
  provisioning: {
    engine: 'jenkins',
    tokenName: process.env.JENKINS_TOKEN_NAME,
    userToken: process.env.JENKINS_USER_TOKEN,
    userName: process.env.JENKINS_USER_NAME,
    url: process.env.JENKINS_URL ? process.env.JENKINS_URL : 'http://localhost:8080',
    provJobName: process.env.JENKINS_JOB_NAME ? process.env.JENKINS_JOB_NAME : 'ppf-deploy-pipeline',
  },
  auth: {
    enabled: false,
    provider: process.env.AUTH_PROVIDER,
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE,
  },
};
