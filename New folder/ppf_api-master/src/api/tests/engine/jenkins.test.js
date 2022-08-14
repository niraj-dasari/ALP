/* eslint-disable arrow-body-style */
const { expect } = require('chai');
const sinon = require('sinon');
const engFactory = require('../../engine/factory');
const logger = require('../../../config/logger');
const config = require('../../../config/vars');

const sandbox = sinon.createSandbox();

describe('Provisioning engine tests for Jenkins', () => {
  config.provisioning.engine = 'jenkins';
  const engine = engFactory.getProvisioningEngine();

  beforeEach(async () => {
  });

  afterEach(() => sandbox.restore());

  describe('provisioning requests', () => {
    let buildId = -1;
    const action = 'create';

    it('should submit a request successfully', () => {
      const parameters = {
        param1: 'value1',
        param2: 'value2',
      };

      return engine.submitRequest(action, parameters)
        .then((res) => {
          logger.info(`Jenkins build job submit response: ${JSON.stringify(res)}`);
          expect(res).to.not.be.null;
          expect(res.status).to.be.equal('success');
          buildId = res.pipelineId;
        });
    });

    it('should get request status successfully', () => {
      logger.info(`Getting build status of build id ${buildId}`);
      return engine.getRequestStatus(buildId).then((res) => {
        logger.info(`Build status is ${JSON.stringify(res)}`);
        expect(res).to.not.be.null;
        expect(res.status).to.be.equal('success');
      });
    });
  });
});
