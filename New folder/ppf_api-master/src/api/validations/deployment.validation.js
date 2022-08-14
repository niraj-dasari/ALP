const Joi = require('joi');
const User = require('../db/mongodb/models/deployment.model');

module.exports = {

  // POST /v1/users
  createDeployment: {
    body: {
      name: Joi.string().max(64).required(),
      type: Joi.string().required(),
      // owner: Joi.string().required(),
      // requester: Joi.string().required(),
    },
  },
};
