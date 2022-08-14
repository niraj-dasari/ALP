const Joi = require('joi');
const User = require('../db/mongodb/models/account.model');

module.exports = {

  createAccount: {
    body: {
      name: Joi.string().required(),
      account_id: Joi.string().required(),
      email: Joi.string().required(),
    },
  },
};