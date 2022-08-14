const config = require('../../config/vars');
const AuthProviderBase = require('./base');
const logger = require('../../config/logger');

const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");

class Auth0 extends AuthProviderBase {
  constructor() {
    super('auth0');
  }

  validateToken = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${config.auth.domain}/.well-known/jwks.json`,
    }),
  
    audience: `${config.auth.audience}`,
    issuer: `https://${config.auth.domain}/`,
    algorithms: ["RS256"],
  });
  
  init = (app) => {
  }
}

module.exports = Auth0;
