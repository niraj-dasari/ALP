const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/deployment.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const { createDeployment } = require('../../validations/deployment.validation');

const router = express.Router();


router
  .route('/')
  .post(validate(createDeployment), controller.create);

router
  .route('/:deploymentId')
  .delete(controller.delete);

router
  .route('/')
  .get(controller.getAll);

router
  .route('/:deploymentId')
  .get(controller.get);

router
  .route('/:deploymentId')
  .put(controller.update);

router
  .route('/:deploymentId/runs')
  .post(controller.createRunDetails);

router
  .route('/:deploymentId/runs/:runId')
  .put(controller.updateRunDetails);

router
  .route('/:deploymentId/runs')
  .get(controller.getAllRunDetails);

router
  .route('/:deploymentId/runs/:runId')
  .get(controller.getRunDetailsById);

router
  .route('/:deploymentId/runs')
  .get(controller.getAllRunDetails);

router
  .route('/:deploymentId/runs/:runId')
  .get(controller.getRunDetailsById);

router
  .route('/:deploymentId/runs/:runId/logs')
  .get(controller.getLogs);

router
  .route('/:deploymentId/runs/:runId/logs')
  .post(controller.addLogs);

module.exports = router;
