const httpStatus = require('http-status');
const APIError = require('../../../errors/api-error');
const mongoose = require('mongoose');

const status = ['submitted', 'active', 'creating', 'deleting', 'deleted', 'expired', 'failed', 'creating', 'updating'];

const deploymentSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  deployment_id: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 64,
  },
  internal_name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 64,
  },
  type: {
    type: String,
    required: true,
  },
  create_time: {
    type: Date,
    default: Date.now,
    required: true,
  },
  lifespan: {
    type: Number,
    required: false,
    default: 24,
  },
  destroy_time: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: status,
  },
  owner: {
    type: String,
    required: true,
  },
  requester: {
    type: String,
    required: true,
  },
  account: {
    type: String,
    required: true,
  },
});

deploymentSchema.method({
  transform() {
    const transformed = {};
    const fields = ['deployment_id', 'name', 'internal_name', 'type', 'status', 'owner', 'requester', 'lifespan', 'destroy_time', 'account', 'create_time'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

deploymentSchema.statics = {
  checkForDuplicateField(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          messages: error.message,
        }],
        status: httpStatus.CONFLICT,
        isPublic: true,
      });
    }

    throw error;
  },
};

module.exports = mongoose.model('Deployment', deploymentSchema);
