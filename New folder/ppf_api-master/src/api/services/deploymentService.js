const dbFactory = require('../db/factory');
const logger = require('../../config/logger');
const db = dbFactory.getDB();
const APIError = require('../errors/api-error');
const httpStatus = require('http-status');
const ID = require("nodejs-unique-numeric-id-generator");

const EngineFactory = require('../engine/factory');
const engine = EngineFactory.getProvisioningEngine();
const catalogSrv = require('./catalogService');

// --- Private methods ---

const _saveDeployment = async (deployment) => {
	logger.info(`deploymentService :: _saveDeployment :: entered`);
	catalog = await db.getCatalogByType(deployment.type)

	if (!catalog) {
		throw new APIError({
			message: `No catalog exist for type  ${deployment.type}`,
			status: httpStatus.BAD_REQUEST,
		});
	}

	// TODO generate sequetial id
	deployment.deployment_id = ID.generate(new Date().toJSON());
	deployment.internal_name = 'ppf-dep-' + deployment.deployment_id;

	// TODO revert back to submitted
	deployment.status = "creating";

	return await db.saveDeployment(deployment);
};

const _getNextRunId = async (deploymentId) => {
	logger.info(`deploymentService :: getNextRunId :: entered with deploymentId = ${deploymentId}`);
	const currentCount = await db.getRunDetailsCount(deploymentId);

	// TODO make this thread safe
	logger.info(`deploymentService :: getNextRunId :: currentCount = ${currentCount}`);
	return currentCount + 1;
};

const _getParametersForEngine = async (deployment) => {
	logger.debug(`deploymentService :: getParametersForEngine :: entered`);

	logger.debug(`deploymentService :: getParametersForEngine :: searching for catalogs with type = ${deployment.type}`);
	const catalog = await catalogSrv.getCatalogByType(deployment.type);
	logger.debug(`deploymentService :: getParametersForEngine :: found catalogs = ${JSON.stringify(catalog)}`);

	const toSkip = ['deployment_id', 'status', 'destroy_time'];
	let engineParams = {};
	for (let key in deployment) {
		if (toSkip.indexOf(key) === -1) {
			engineParams[key] = deployment[key];
		}
	}

	if (catalog.provider) {
		engineParams.provider = catalog.provider;
	} else {
		engineParams.provider = 'azure';
	}

	if (catalog.capabilities && catalog.capabilities.cardinality) {
		engineParams.cardinality = catalog.capabilities.cardinality;
	}

	if (catalog.capabilities && catalog.capabilities.linked_type) {
		engineParams.linked_type = catalog.capabilities.linked_type;
	}

	if (catalog.capabilities && catalog.capabilities.require_license) {
		engineParams.require_license = catalog.capabilities.require_license;
	}

	return engineParams;
};

const _submitRequestToEngine = async (deployment, runId, action, params) => {
	logger.info(`deploymentService :: submitRequestToEngine :: entered`);
	return engine.submitRequest(deployment.deployment_id, runId, action, params);
};

module.exports = {
	// --- Deployments ---

	async createDeployment(deployment, action) {
		// check if deployment type is valid
		catalog = await db.getCatalogByType(deployment.type)
		if (!catalog) {
			throw new APIError({
				message: `No catalog exist for type ${deployment.type}`,
				status: httpStatus.BAD_REQUEST,
			});
		}

		// save deployment
		const dep = await _saveDeployment(deployment);
		logger.info(`deploymentService :: createDeployment :: dep = ${JSON.stringify(dep)}`);
		if (!dep) {
			throw new APIError({
				status: httpStatus[500],
				message: `Error while saving deployment`,
			});
		}

		// get next run id
		const runId = await _getNextRunId(dep.deployment_id);
		logger.info(`deploymentService :: createDeployment :: runId = ${runId}`);
		if (!runId) {
			throw new APIError({
				status: httpStatus[500],
				message: `Error while getting next run id`,
			});
		}

		// generate parameter list to pass to engine  
		const params = await _getParametersForEngine(dep);
		logger.info(`deploymentService :: createDeployment :: params = ${JSON.stringify(params)}`);

		// submit request to engine
		const req = await _submitRequestToEngine(dep, runId, action, params);
		logger.info(`deploymentService :: createDeployment :: req = ${JSON.stringify(req)}`);
		if (!req) {
			throw new APIError({
				status: httpStatus[500],
				message: `Error while submitting request to engine`,
			});
		}

		// save run details in db
		const rd = {
			prov_engine_id: req.pipelineId,
			request: params,
		};
		const runDetailsResp = await db.addRunDetails(dep.deployment_id, runId, rd);
		logger.info(`deploymentService :: createDeployment :: runDetailsResp = ${JSON.stringify(runDetailsResp)}`);
		if (!runDetailsResp) {
			throw new APIError({
				status: httpStatus[500],
				message: `Error while saving run details`,
			});
		}

		return dep;
	},


	async deleteDeployment(deployment_id, action) {
		logger.info(`deploymentService :: deleteDeployment :: for deployment id = ${deployment_id}`);
		const deployment = {
			status: 'deleting',
		}

		// update deployment
		logger.info(`deploymentService :: deleteDeployment :: updating deployment with status delete`);
		const dep = await this.updateDeployment(deployment_id, deployment)

		// get next run id
		const runId = await _getNextRunId(dep.deployment_id);
		logger.info(`deploymentService :: deleteDeployment :: runId = ${runId}`);
		if (!runId) {
			throw new APIError({
				status: httpStatus[500],
				message: `Error while getting next run id`,
			});
		}

		// generate parameter list to pass to engine  
		const params = await _getParametersForEngine(dep);
		logger.info(`deploymentService :: deleteDeployment :: params = ${JSON.stringify(params)}`);

		// submit request to engine
		const req = await _submitRequestToEngine(dep, runId, action, params);
		logger.info(`deploymentService :: deleteDeployment :: req = ${JSON.stringify(req)}`);
		if (!req) {
			throw new APIError({
				status: httpStatus[500],
				message: `Error while submitting request to engine`,
			});
		}

		// save run details in db
		const rd = {
			prov_engine_id: req.pipelineId,
			request: params,
		};
		const runDetailsResp = await db.addRunDetails(dep.deployment_id, runId, rd);
		logger.info(`deploymentService :: deleteDeployment :: runDetailsResp = ${JSON.stringify(runDetailsResp)}`);
		if (!runDetailsResp) {
			throw new APIError({
				status: httpStatus[500],
				message: `Error while saving run details`,
			});
		}

		return dep;
	},

	async getDeployment(deploymentId) {
		logger.info(`deploymentService :: getDeployment :: entered`);
		return await db.getDeployment(deploymentId);
	},

	async searchDeployments(filter) {
		logger.info(`deploymentService :: searchDeployments :: entered, filter = ${filter}`);
		return await db.searchDeployments(filter);
	},

	async updateDeployment(deployment_id, deployment) {
		logger.info(`deploymentService :: updateDeployment :: entered with deployment_id ${deployment_id}`)
		return await db.updateDeployment(deployment_id, deployment);
	},

	// --- Run details ---

	async addRunDetails(deploymentId, runDetails) {
		logger.info(`deploymentService :: addRunDetails :: entered with deployment_id = ${deploymentId}`);

		// TODO check deployment id is valid

		// add run details to db
		const nextRunId = await _getNextRunId(deploymentId);
		if (!runDetails.status) {
			runDetails.status = 'running';
		}

		const runObjResult = await db.addRunDetails(deploymentId, nextRunId, runDetails);
		if (!runObjResult) {
			throw new APIError({
				status: httpStatus[500],
				message: 'Error while adding run details',
			})
		}

		// if this is new run, update deployment status to updating
		if (nextRunId > 1) {
			const updDeployObj = {
				status: 'updating'
			};

			const deploymentObjResult = await db.updateDeployment(deploymentId, updDeployObj);
			if (!deploymentObjResult) {
				throw new APIError({
					status: httpStatus[500],
					message: 'Error while updating deployment',
				})
			}
		}

		return runObjResult;
	},

	async updateRunDetails(deploymentId, runId, runDetails) {
		logger.info(`deploymentService :: updateRunDetails :: entered with deploymentId ${deploymentId} and runId ${runId}`)

		// update run details 
		const runResult = await db.updateRunDetails(deploymentId, runId, runDetails);
		if (!runResult) {
			throw new APIError({
				status: httpStatus[500],
				message: 'Error while updating run details',
			})
		}

		// if run is complete, update deployment status to complete
		let existingDeployment = await db.getDeployment(deploymentId);
		let depObj = {};
		if (runResult.status && existingDeployment.status === 'creating' && runResult.status === 'complete') {
			depObj.status = 'created';
		} else if (runResult.status && existingDeployment.status === 'deleting' && runResult.status === 'complete') {
			depObj.status = 'deleted';
		} else if (runResult.status && runResult.status === 'failed') {
			depObj.status = 'failed';
		}

		logger.info(`deploymentService :: updateRunDetails :: updating deployment, depObj = ${JSON.stringify(depObj)}`);
		const depObjResult = await db.updateDeployment(deploymentId, depObj);
		if (!depObjResult) {
			throw new APIError({
				status: httpStatus[500],
				message: 'Error while updating deployment',
			})
		}

		return runResult;
	},

	async getAllRunDetails(deploymentId) {
		logger.info(`deploymentService :: getAllRunDetails :: entered with deploymentId = ${deploymentId}`);
		return await db.getAllRunDetails(deploymentId);
	},

	async getLatestRunDetails(deploymentId) {
		logger.info(`deploymentService :: getLatestRunDetails :: entered with deploymentId = ${deploymentId}`);
		return await db.getLatestRunDetails(deploymentId);
	},

	async getRunDetailsById(deploymentId, runId) {
		logger.info(`deploymentService :: getRunDetailsById :: entered with deploymentId = ${deploymentId}, runId = ${runId}`);
		return await db.getRunDetails(deploymentId, runId);
	},

	// --- Provisioning logs ---

	async getLogs(deploymentId, runId) {
		logger.info(`deploymentService :: getLogs :: entered with deploymentId = ${deploymentId}, runId = ${runId}`);
		return await db.getLogs(deploymentId, runId);
	},

	async addLogs(deploymentId, runId, logData) {
		logger.info(`deploymentService :: addLog :: entered with deploymentId = ${deploymentId}, runId = ${runId}`);
		// TODO ensure deployment id and run id are valid 
		return await db.addLog(deploymentId, runId, logData);
	},

}
