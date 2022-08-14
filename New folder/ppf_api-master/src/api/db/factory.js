const { db } = require('../../config/vars');
const MongoDB = require('./mongodb/mongodb');
const logger = require('../../config/logger');

class DBFactory {
  getDB() {
    logger.info(`Configured db: ${db.provider}`);
    if (db.provider === 'mongodb') {
      return new MongoDB();
    }
  }
}

module.exports = new DBFactory();
