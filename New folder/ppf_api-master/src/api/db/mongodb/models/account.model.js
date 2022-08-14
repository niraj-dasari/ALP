const httpStatus = require('http-status');
const APIError = require('../../../errors/api-error');
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
    trim: true,
  },
  account_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 64,
  },
  email: {
    type: String,
    trim: true,
  },
  is_default: {
    type: Boolean,
    dafault: false,
  },
});

accountSchema.method({
  transform() {
    const transformed = {};
    const fields = ['name', 'account_id', 'email', 'is_default'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

accountSchema.statics = {
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

module.exports = mongoose.model('Account', accountSchema);
