const mongoose = require('mongoose');

const status = ['running', 'complete', 'failed'];

const runDetailsSchema = new mongoose.Schema({
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
  prov_engine_id: {
    type: Number,
    required: true,
  },
  request: [mongoose.Schema.Types.Mixed],
  output: [mongoose.Schema.Types.Mixed],
  status: {
    type: String,
    enum: status,
  },
  submit_time: {
    type: Date,
    default: Date.now,
    required: true,
  },
  completion_time: {
    type: Date,
  },
});

runDetailsSchema.method({
  transform() {
    const transformed = {};
    const fields = ['deployment_id', 'run_id', 'prov_engine_id', 'request', 'output', 'status', 'submit_time', 'completion_time'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

module.exports = mongoose.model('RunDetails', runDetailsSchema);
