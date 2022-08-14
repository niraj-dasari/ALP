const { auth } = require('../../config/vars');
const Auth0 = require('./auth0');
const logger = require('../../config/logger');

class AuthFactory {
  getAuthProvider() {
    logger.info(`factory :: getAuthProvider :: Configured provider = ${auth.provider}`);
    if (auth.provider === 'auth0') {
			logger.info(`factory :: getAuthProviders :: auth config = ${JSON.stringify(auth)}`);
      return new Auth0();
    }

    return null;
  }
}

module.exports = new AuthFactory();
