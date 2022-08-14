const logger = require('../../config/logger');

class DB {
  constructor(name) {
    this.name = `${name}-${Math.random().toString(36).substring(2, 15)}`;
  }

  calculateDestroyTime(lifespan) {
    if (lifespan == null) {
      logger.info('calculateDestroyTime, No lifespan specified. Default to 24 hrs');
      lifespan = 24;
    }

    const now = new Date();
    const destroyTime = new Date(now.getTime() + (3600000 * lifespan));
    logger.info(`calculateDestroyTime, destroyTime: ${destroyTime}`);
    return destroyTime;
  }

  saveDeployment(deployment) {
    return `saveDeployment, deployment: ${JSON.stringify(deployment)}`;
  }

  updateDeployment(deploymentId, deployment) {
    return `updateDeployment, deploymentId: ${deploymentId}, deployment: ${JSON.stringify(deployment)}`;
  }

  addRunDetails(deploymentId, run) {
    return `addRunDetails, deploymentId: ${deploymentId}, run: ${JSON.stringify(run)}`;
  }


  getAllRunDetails(deploymentId) {
    return `getAllRunDetails,  deploymentId: ${deploymentId}`;
  }

  getRunDetails(deploymentId, runId) {
    return `getRunDetails,  deploymentId: ${deploymentId}, runId: ${runId}`;
  }

  searchDeployments(filter) {
    return `searchDeployments, filter: ${JSON.stringify(filter)}`;
  }

	searchCatalogs(filter) {
		return `searchCatalogs, filter: ${JSON.stringify(filter)}`;
	}
}

module.exports = DB;
