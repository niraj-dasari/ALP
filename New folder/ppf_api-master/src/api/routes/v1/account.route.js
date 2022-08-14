const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/account.controller');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const { createAccount } = require('../../validations/account.validation');

const router = express.Router();

router
  .route('/')
  .post(validate(createAccount), controller.create);

router
  .route('/')
  .get(controller.getAll);

router
  .route('/:accountId')
  .get(controller.get);

module.exports = router;
