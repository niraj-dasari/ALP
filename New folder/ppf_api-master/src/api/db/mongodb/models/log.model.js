const httpStatus = require('http-status');
const APIError = require('../../../errors/api-error');
const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  deployment_id: {
    type: Number,
    required: true,
    index: true,
  },
  run_id: {
    type: Number,
    required: true,
    index: true,
  },
  log: {
    type: String,
    required: true,
    maxlength: 256,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

logSchema.method({
  transform() {
    const transformed = {};
    const fields = ['deployment_id', 'run_id', 'log', 'timestamp'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

logSchema.statics = {
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

module.exports = mongoose.model('Log', logSchema);
