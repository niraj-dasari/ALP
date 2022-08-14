const mongoose = require('mongoose');
const APIError = require('../../../errors/api-error');
const httpStatus = require('http-status');


const providers = ['azure', 'aws', 'gcp', 'ibmcloud', 'oci'];
const fieldTypes = ['radio', 'text', 'select', 'checkbox'];

// https://mongoosejs.com/docs/schematypes.html
const fieldSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 32,
  },
  display_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 64,
  },
  place_holder: {
    type: String,
    trim: true,
    maxlength: 64,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 128,
  },
  type: {
    type: String,
    enum: fieldTypes,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: true,
  },
  default: {
    type: String,
    trim: true,
  },
  validation_message: {
    type: String,
    trim: true,
    maxlength: 128,
  },
  validation: {
    type: String,
    maxlength: 128,
  },
  rbac: {
    type: [String],
  },
});

const catalogSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  type: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    maxlength: 32,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 64,
  },
  display_name: {
    type: String,
    required: false,
    trim: true,
    maxlength: 128,
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: 256,
  },
  provider: {
    type: String,
    enum: providers,
    default: 'azure',
  },
  capabilities: {
    cardinality: {
      type: Number,
    },
    linked_type: {
      type: String,
    },
    rbac: {
      type: String,
    },
    require_license: {
      type: Boolean,
    },
  },
  fields: [fieldSchema],
});

catalogSchema.method({
  transform() {
    const transformed = {};
    const fields = ['_id', 'provider', 'capabilities', 'type', 'name', 'description', 'fields'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

});

catalogSchema.statics = {
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

module.exports = mongoose.model('Catalog', catalogSchema);
