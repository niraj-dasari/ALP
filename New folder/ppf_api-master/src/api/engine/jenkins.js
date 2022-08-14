const axios = require('axios');
const config = require('../../config/vars');
const ProvisioningEngine = require('./base');
const logger = require('../../config/logger');
const APIError = require('../errors/api-error');
const httpStatus = require('http-status');

const _getBuildInfo = async (submitBuildStatus) => {
	const url = `${submitBuildStatus.metadata.location}api/json`;
	const reqConfig = {
		method: 'get',
		url,
		headers: {
			'Content-Type': 'application/json',
		},
		auth: {
			username: config.provisioning.userName,
			password: config.provisioning.userToken,
		},
	};
	logger.info(`jenkins :: _getBuildInfo :: reqConfig = ${reqConfig}`);

	return axios(reqConfig)
		.then((res) => {
			logger.info(`jenkins :: _getBuildInfo :: res = ${res.data.executable}`);
			submitBuildStatus.status = 'success';
			submitBuildStatus.pipelineId = res.data.executable.number;
			submitBuildStatus.metadata.buildUrl = res.url;
			return submitBuildStatus;
		})
		.catch((err) => {
			logger.error(`jenkins :: _getBuildInfo :: error = ${err}`);
			submitBuildStatus.status = 'fail';
			submitBuildStatus.error = err;
			return submitBuildStatus;
		});
};

const _buildParameters = (deploymentId, runId, action, parameters) => {
	const ret = `deploymentId=${deploymentId}&runId=${runId}&action=${action}&deploymentParameters=${JSON.stringify(parameters)}`;
	return ret;
};

const _submitBuild = async (deploymentId, runId, action, parameters) => {
	const paramStr = _buildParameters(deploymentId, runId, action, parameters);
	logger.info(`jenkins :: _submitBuild :: paramStr = ${paramStr}`);

	const url = `${config.provisioning.url}/job/${config.provisioning.provJobName}/buildWithParameters?delay=0sec&token=${config.provisioning.tokenName}&${paramStr}`;
	logger.info(`jenkins :: _submitBuild :: url = ${url}`);
	const reqConfig = {
		method: 'post',
		url: url,
		headers: {
			'Content-Type': 'application/json',
		},
		auth: {
			username: config.provisioning.userName,
			password: config.provisioning.userToken,
		},
	};

	logger.debug(`jenkins :: _submitBuild :: reqConfig = ${reqConfig}`);
	return axios(reqConfig)
		.then((res) => {
			logger.debug(`jenkins :: _submitBuild :: location = ${res.headers.location}`);
			const ret = {
				status: 'success',
				metadata: {
					engine: 'jenkins',
					location: res.headers.location,
				},
			};
			return ret;
		})
};

class Jenkins extends ProvisioningEngine {
  constructor() {
    super('jenkins');
  }

  /**
   * Submits a build job request in Jenkins
   * @param {*} action
   * @param {*} parameters
   * @returns
   */
  async submitRequest(deploymentId, runId, action, parameters) {
    logger.info(`jenkins :: submitRequest :: entry, deploymentId = ${deploymentId}, runId = ${runId}, action = ${action}, parameters = ${JSON.stringify(parameters)}`);
    const sb = await _submitBuild(deploymentId, runId, action, parameters);
    return await _getBuildInfo(sb);
  }

  /**
   * Returns status of the build request submitted in Jenkins
   * @param {*} buildId
   * @returns
   */
  async getRequestStatus(buildId) {
    const url = `${config.provisioning.url}/job/${config.provisioning.provJobName}/${buildId}/api/json`;
    const reqConfig = {
      method: 'get',
      url,
      auth: {
        username: config.provisioning.userName,
        password: config.provisioning.userToken,
      },
    };
    logger.debug(`jenkins :: getRequestStatus :: reqConfig = ${JSON.stringify(reqConfig)}`);

    return axios(reqConfig)
      .then((res) => {
        logger.debug(`jenkins :: getRequestStatus :: res = ${res.data}`);
        const buildStatus = {
          status: 'success',
          result: res.data.result ? res.data.result.toLowerCase() : 'in progress',
          duration: res.data.duration === 0 ? res.data.duration : '-',
          timestamp: res.data.timestamp,
        };
        return buildStatus;
      })
      .catch((err) => {
        logger.error(`jenkins :: getRequestStatus :: error = ${err}`);
        const buildStatus = {
          status: 'fail',
          error: err,
        };
        return buildStatus;
      });
  }
}

module.exports = Jenkins;
