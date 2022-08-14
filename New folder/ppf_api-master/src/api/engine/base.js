class ProvisioningEngine {
  constructor(name) {
  }

  submitRequest(deploymentId, action, parameters) {
    const ret = `base :: submitRequest :: deploymentId = ${deploymentId}, action = ${action}, parameters = ${JSON.stringify(parameters)}`;
    return ret;
  }

  getRequestStatus(request) {
    const ret = `base :: getRequestStatus :: request = ${JSON.stringify(request)}`;
    return ret;
  }
}

module.exports = ProvisioningEngine;
