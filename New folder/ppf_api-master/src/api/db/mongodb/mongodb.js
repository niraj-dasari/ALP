const mongoose = require('mongoose');
const monLib = require('../../../config/mongoose');
const logger = require('../../../config/logger');

const APIError = require('../../errors/api-error');
const httpStatus = require('http-status');

const DB = require('../base');
const Deployment = require('./models/deployment.model');
const RunDetails = require('./models/run.details.model');
const Logs = require('./models/log.model');
const Catalog = require('./models/catalog.model');
const Account = require('./models/account.model');

// TODO refactor this into dao objects
class MongoDB extends DB {
  constructor() {
    super('mongodb');

    logger.info('mongodb :: Connecting to mongodb..');
    monLib.connect();
  }

	// --- Catalog related ---

  async saveCatalog(catalog) {
    const cat = new Catalog({
      _id: new mongoose.Types.ObjectId(),
      type: catalog.type,
      name: catalog.name,
      display_name: catalog.display_name,
      description: catalog.description,
      provider: catalog.provider,
      catabilities: {
        cardinality: (catalog.catabilities && catalog.catabilities.cardinality) ? catalog.catabilities.cardinality : null,
        linked_type: (catalog.catabilities && catalog.catabilities.linked_type) ? catalog.catabilities.linked_type : null,
        rbac: (catalog.catabilities && catalog.catabilities.rbac) ? catalog.catabilities.rbac : null,
        require_license: (catalog.catabilities && catalog.capabilities.require_license) ? catalog.catabilities.require_license : null,
      },
      fields: catalog.fields,
    });

    const savedCatalog = await cat.save();
    return savedCatalog.transform();
  }

  async getCatalogs() {
    logger.info(`mongodb :: getAllCatalogs :: entered`);
    const catalogs = await Catalog.find().exec()
    var catalogsTransformed = [];
    catalogs.forEach(catalog => {
      catalogsTransformed.push(catalog.transform());
    });

    return catalogsTransformed;
  }

  async getCatalog(_id) {
    logger.info(`mongodb :: getCatalog :: entered with _id = ${_id}`);
    const catalog = await Catalog.findById(_id).exec();

    if (catalog) {
      return catalog.transform();
    }

    throw new APIError({
      message: 'Catalog does not exist',
      status: httpStatus.NOT_FOUND,
    });

  }

  async getCatalogByType(type) {
    logger.info(`mongodb :: getCatalogByType :: entered  with type = ${type}`);
    let catalog = await Catalog.findOne({ type: type }).exec();

    if (catalog) {
      return catalog.transform();
    } else {
      return null;
    }
  }

	// --- Deployments related ----

  async updateDeployment(deploymentId, deployment) {
    logger.info(`mongodb:: updateDeployment, entered with deploymentId = ${deploymentId} `);
    await this.getDeployment(deploymentId);

    if (deployment.lifespan) {
      deployment.destroy_time = this.calculateDestroyTime(deployment.lifespan)
    }

    const query = { deployment_id: deploymentId };
    const option = { new: true };
    const updatedDeployment = await Deployment.findOneAndUpdate(query, deployment, option);
    return updatedDeployment.transform();
  }

  async getDeplomentById(deploymentId) {
    // https://mongoosejs.com/docs/async-await.html
    return await Deployment.findOne({ deployment_id: deploymentId });
  }

  async saveDeployment(deployment) {
    logger.info(`mogodbjs :: saveDeployment :: entered`);

    let deploymentObj = new Deployment(deployment);
    deploymentObj._id = new mongoose.Types.ObjectId();
    deploymentObj.destroy_time = this.calculateDestroyTime(deploymentObj.lifespan);
    logger.debug(`mongodb :: saveDeployment :: now saving deployment  :${deploymentObj}`);
    const savedDeployment = await deploymentObj.save();
    return savedDeployment.transform();
  }

  async getDeployment(deploymentId) {
    logger.info(`mongodb :: getDeployment :: entered with deploymentId ${deploymentId}`);
    const deployment = await Deployment.findOne({ deployment_id: deploymentId }).exec();

    if (deployment) {
      return deployment.transform();
    }

    throw new APIError({
      message: 'Deployment does not exist',
      status: httpStatus.NOT_FOUND,
    });
  }

	// --- Run details related ----

  async updateRunDetails(deploymentId, runId, runDetails) {
    logger.info(`mongodb :: updateRunDetails :: entered with deploymentId = ${deploymentId}, runId = ${runId}`);
    await this.getDeployment(deploymentId);

    let details = await RunDetails.findOne({ deployment_id: deploymentId, run_id: runId });
    if (!details) {
      throw new APIError({
        message: `No Run details found with deploymentId ${deploymentId} and run_id ${runId}`,
        status: httpStatus.NOT_FOUND,
      });
    }

    details.request = runDetails.request;
    details.output = runDetails.output ? runDetails.output : null;
    details.status = runDetails.status ? runDetails.status : details.status;
    if (details.status === 'complete') {
      details.completion_time = new Date();
    }

    const query = { deployment_id: deploymentId, run_id: runId };
    const option = { new: true };
    const updatedRunDetails = await RunDetails.findOneAndUpdate(query, details, option);
    return updatedRunDetails.transform();
  }

  async updateRunDetails(deploymentId, runId, runDetails) {
    logger.info(`mongodb :: updateRunDetails :: entered with deploymentId = ${deploymentId}, runId = ${runId}`);
    await this.getDeployment(deploymentId);

    let details = await RunDetails.findOne({ deployment_id: deploymentId, run_id: runId });
    if (!details) {
      throw new APIError({
        message: `No Run details found with deploymentId ${deploymentId} and run_id ${runId}`,
        status: httpStatus.NOT_FOUND,
      });
    }

    details.request = runDetails.request;
    details.output = runDetails.output ? runDetails.output : null;
    details.status = runDetails.status ? runDetails.status : details.status;
    if (details.status === 'complete') {
      details.completion_time = new Date();
    }

    const query = { deployment_id: deploymentId, run_id: runId };
    const option = { new: true };
    const updatedRunDetails = await RunDetails.findOneAndUpdate(query, details, option);
    return updatedRunDetails.transform();
  }

	async getAllRunDetails(deploymentId) {
    return await RunDetails.find({ deployment_id: deploymentId });
  }

  async getRunDetails(deploymentId, runId) {
    return await RunDetails.find({ deployment_id: deploymentId, run_id: runId });
  }

  async getLatestRunDetails(deploymentId) {
    return await RunDetails.find({ deployment_id: deploymentId }).sort({ run_id: -1 }).limit(1);
  }

  async getRunDetailsCount(deploymentId) {
    logger.info(`mongodb :: getRunDetailsCount, entered with deploymentId = ${deploymentId}`);
    const count = await RunDetails.countDocuments({ deployment_id: deploymentId });
    logger.info(`mongodb :: getRunDetailsCount, count = ${count}`);

    return count;
  }

	// --- Account related ---

  async saveAccount(account) {
    logger.info(`mogodbjs :: saveAccount :: entered with details ${account}`);
    let accountObj = new Account(account);
    accountObj._id = new mongoose.Types.ObjectId();

    const savedAccount = await accountObj.save();
    return savedAccount.transform();
  }

  async getAccounts() {
    logger.info(`mongodb :: getAccounts :: entered`);
    const accounts = await Account.find().exec();
    var accountsTransformed = [];
    accounts.forEach(account => {
      accountsTransformed.push(account.transform());
    });

    return accountsTransformed;
  }

  async getAccountByAccountId(accountId) {
    logger.info(`mongodb :: getAccountByAccountIde :: entered  with accountId = ${accountId}`);
    let account = await Account.findOne({ account_id: accountId }).exec();

    if (account) {
      return account.transform();
    } else {
      return null;
    }
  }

  // TODO paginate results
  async searchDeployments(filter) {
    return await Deployment.find(filter);
  }

  async checkForDeploymentDuplicateField(error) {
    return await Deployment.checkForDuplicateField(error);
  }

  async checkForCatalogDuplicateField(error) {
    return await Catalog.checkForDuplicateField(error);
  }

  async checkForAccountDuplicateField(error) {
    return await Account.checkForDuplicateField(error);
  }

	// --- Logs related

  async addLog(deploymentId, runId, logdata) {
    logger.info(`mogodbjs :: addLog :: entered`);

    let logObj = new Logs(logdata);
		logObj.deployment_id = deploymentId;
		logObj.run_id = runId;
    logObj._id = new mongoose.Types.ObjectId();

    logger.debug(`mongodb :: addLog :: now adding log :${JSON.stringify(logObj)}`);
    const savedLog = await logObj.save();
    return savedLog.transform();
  }

	async getLogs(deploymentId, runId) {
    return await Logs.find({ deployment_id: deploymentId, run_id: runId });
  }
}

module.exports = MongoDB;
