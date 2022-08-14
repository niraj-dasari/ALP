const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/catalog.controller');
const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */

router
  .route('/')
  .post(controller.create)
  .get(controller.list);

router
  .route('/:catalogId')
  .get(controller.get);

router
  .route('/type/:type')
  .get(controller.getByType);

module.exports = router;
