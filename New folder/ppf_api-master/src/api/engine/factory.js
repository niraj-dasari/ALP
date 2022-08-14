const { provisioning } = require('../../config/vars');
const Jenkins = require('./jenkins');
const logger = require('../../config/logger');

// https://www.bezkoder.com/node-js-factory-pattern/
class ProvisioningEngineFactory {
  getProvisioningEngine() {
    logger.info(`factory :: getProvisioningEngine :: Configured engine = ${provisioning.engine}`);
    if (provisioning.engine === 'jenkins') {
			logger.info(`factory :: getProvisioningEngine :: jenkins config = ${JSON.stringify(provisioning)}`);
      return new Jenkins();
    }

    return null;
  }
}

module.exports = new ProvisioningEngineFactory();
