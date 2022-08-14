const httpStatus = require('http-status');
const logger = require('../../config/logger');
const deploymentService = require('../services/deploymentService')

exports.get = async (req, res, next) => {
  try {
    logger.info(`deployment.contoller :: get :: entered with deploymentId = ${req.params.deploymentId}`);
    const deployment = await deploymentService.getDeployment(req.params.deploymentId);
    res.json(deployment);
  } catch (error) {
    logger.info(`deployment_contoller :: get :: error = ${error}`);
    return next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    logger.info(`deployment.contoller :: getAll :: entered`);

    // TODO manage session and get userid from session
    let filter = {};
    if (req.session && req.session.userid) {
      filter.owner = req.session.userid;
    }

    const deployment = await deploymentService.searchDeployments(filter);
    res.json(deployment);
  } catch (error) {
    logger.info(`deployment_contoller :: get :: error :${error}`);
    return next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    logger.info("deployment.contoller :: create :: entered");

    // TODO manage session and get userid from session
    let depObj = req.body;
    if (req.session && req.session.userid) {
      depObj.owner = req.session.userid;
    } else {
      depObj.owner = "dummy-user";
    }

    if (!depObj.requester) {
      depObj.requester = depObj.owner;
    }

    const savedDeployment = await deploymentService.createDeployment(depObj, 'create');
    res.status(httpStatus.CREATED);
    res.json(savedDeployment);
  } catch (error) {
    logger.info(`deployment.contoller :: create :: error = ${error}`);
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {

    logger.info(`deployment.contoller :: update :: entered with deploymentId = ${req.params.deploymentId}`);
    const updatedDeployment = await deploymentService.updateDeployment(req.params.deploymentId, req.body);


    res.status(httpStatus.OK);
    res.json(updatedDeployment);
  } catch (error) {
    logger.info(`deployment.contoller :: update :: error for deploymentId = ${req.params.deploymentId}, error = ${error}`);
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    logger.info(`deployment.contoller :: delete :: entered with deploymentId = ${req.params.deploymentId}`);

    const deletedDeployment = await deploymentService.deleteDeployment(req.params.deploymentId, 'delete');
    res.status(httpStatus.OK);
    res.json(deletedDeployment);
  } catch (error) {
    logger.info(`deployment.contoller :: delete :: error = ${error}`);
    next(error);
  }
};

exports.createRunDetails = async (req, res, next) => {
  try {
    logger.info(`deployment.contoller :: createRunDetails :: entered with deploymentId = ${req.params.deploymentId}`);
    const savedDeployment = await deploymentService.addRunDetails(req.params.deploymentId, req.body);
    res.status(httpStatus.CREATED);
    res.json(savedDeployment);
  } catch (error) {
    logger.info(`deployment.contoller :: create_run_details :: error :${error}`);
    next(error);
  }
};

exports.updateRunDetails = async (req, res, next) => {
  try {

    logger.info(`deployment.contoller :: updateRunDetails :: entered with deploymentId = ${req.params.deploymentId}, runId = ${req.params.runId}`);
    const savedDeployment = await deploymentService.updateRunDetails(req.params.deploymentId, req.params.runId, req.body);

    res.status(httpStatus.OK);
    res.json(savedDeployment);
  } catch (error) {
    logger.info(`deployment.contoller :: updateRunDetails :: error = ${error}`);
    next(error);
  }
};

exports.getAllRunDetails = async (req, res, next) => {
  try {
    logger.info(`deployment.contoller :: getAllRunDetails :: entered with deploymentId ${req.params.deploymentId}`);
    const allRuns = await deploymentService.getAllRunDetails(req.params.deploymentId);
    res.json(allRuns);
  } catch (error) {
    logger.info(`deployment.contoller :: getAllRunDetails :: error = ${error}`);
    next(error);
  }
};

exports.getRunDetailsById = async (req, res, next) => {
  try {
    logger.info(`deployment.contoller :: getRunDetailsById :: entered with deploymentId = ${req.params.deploymentId}, runId = ${req.params.runId}`);
    let run
    if (req.params.runId == 'latest') {
      run = await deploymentService.getLatestRunDetails(req.params.deploymentId);
    } else {
      run = await deploymentService.getRunDetailsById(req.params.deploymentId, req.params.runId);
    }

    res.json(run);
  } catch (error) {
    logger.info(`deployment.contoller :: getAllRunDetails :: error = ${error}`);
    next(error);
  }
};

exports.getLogs = async (req, res, next) => {
  try {
    logger.info(`deployment.contoller :: getLogs :: entered with deploymentId = ${req.params.deploymentId}, runId = ${req.params.runId}`);
    const logs = await deploymentService.getLogs(req.params.deploymentId, req.params.runId);
    res.json(logs);
  } catch (error) {
    logger.info(`deployment.contoller :: getLogs :: error :${error}`);
    next(error);
  }
};

exports.addLogs = async (req, res, next) => {
  try {
    logger.info(`deployment.contoller :: AddLog :: entered with deploymentId = ${req.params.deploymentId}, runId = ${req.params.runId}`);
    const log = await deploymentService.addLogs(req.params.deploymentId, req.params.runId, req.body);
    res.status(httpStatus.CREATED);
    res.json(log);
  } catch (error) {
    logger.info(`deployment.contoller :: AddLog :: error :${error}`);
    next(error);
  }
};
