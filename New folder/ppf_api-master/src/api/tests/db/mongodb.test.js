/* eslint-disable arrow-body-style */
const { expect } = require('chai');
const sinon = require('sinon');
const dbFactory = require('../../db/factory');
const logger = require('../../../config/logger');
const config = require('../../../config/vars');

const sandbox = sinon.createSandbox();

describe('Database tests for Mongodb', () => {
  config.db.provider = 'mongodb';
  const db = dbFactory.getDB();

  beforeEach(async () => {
  });

  afterEach(() => sandbox.restore());

  describe('catalogs', () => {
    it('saveCatalog - dummy catalog', () => {
      const cat = {
				type: 'some-type',
				name: 'some-catalog-name',
				display_name: 'some-catalog-display-name',
				description: 'some-catalog-description',
				provider: 'azure',
				lifespan: -1,
				fields: [],
			};

      return db.saveCatalog(cat)
        .then((res) => {
          logger.info(`Catalog save response: ${JSON.stringify(res)}`);
          expect(res).to.not.be.null;
        })
				.catch((err) => {
          logger.error(`Catalog save response error: ${JSON.stringify(err)}`);
				});
    });
  });

  describe('deployments', () => {
		const dt = new Date();
		const depId = dt.getTime();

		it('saveDeployment - initial deployment record', () => {
      const dep = {
        deploymentId: depId,
        name: 'small website',
        type: 'my_website-' + depId,
        status: 'submitted',
        owner: 'some-owner-id-' + depId,
        requester: 'some-requester-id',
      };

      return db.saveDeployment(dep)
        .then((res) => {
          logger.info(`Deployment save response: ${JSON.stringify(res)}`);
          expect(res).to.not.be.null;
          expect(res._id).to.not.be.null;
          expect(res.deployment_id).to.equal(depId);
					expect(res.name).to.equal(dep.name);
					expect(res.type).to.equal(dep.type);
					expect(res.destroy_time).to.not.be.null;
					expect(res.status).to.equal(dep.status);
					expect(res.owner).to.equal(dep.owner);
					expect(res.requester).to.equal(dep.requester);
					expect(res.create_time).to.not.be.null;
        })
				.catch((err) => {
          logger.error(`Deployment save response error: ${JSON.stringify(err)}`);
				});
    });

		it('saveDeployment - 2nd deployment record', () => {
      const dep = {
        deploymentId: depId + 1,
        name: 'medium website',
        type: 'my_website-' + depId,
        status: 'submitted',
        owner: 'some-owner-id-' + depId + 1,
        requester: 'some-requester-id-2',
      };

      return db.saveDeployment(dep)
        .then((res) => {
          logger.info(`Deployment save response: ${JSON.stringify(res)}`);
          expect(res).to.not.be.null;
          expect(res._id).to.not.be.null;
          expect(res.deployment_id).to.equal(depId + 1);
					expect(res.name).to.equal(dep.name);
					expect(res.type).to.equal(dep.type);
					expect(res.destroy_time).to.not.be.null;
					expect(res.status).to.equal(dep.status);
					expect(res.owner).to.equal(dep.owner);
					expect(res.requester).to.equal(dep.requester);
					expect(res.create_time).to.not.be.null;
        })
				.catch((err) => {
          logger.error(`Deployment save response error: ${JSON.stringify(err)}`);
				});
    });

		it('updateDeployment - update status and lifespan', () => {
			const dep = {
        status: 'creating',
        lifespan: 48,
      };

      return db.updateDeployment(depId, dep)
        .then((res) => {
          logger.info(`Deployment details update response: ${JSON.stringify(res)}`);
          expect(res).to.not.be.null;
        })
				.catch((err) => {
          logger.error(`Deployment details update response error: ${JSON.stringify(err)}`);
				});
    });

		it('getDeplomentById', () => {
      return db.getDeplomentById(depId)
        .then((res) => {
          logger.info(`Deployment details get response: ${JSON.stringify(res)}`);
          expect(res).to.not.be.null;
					expect(res.deployment_id).to.equal(depId);
        })
				.catch((err) => {
          logger.error(`Deployment details get response error: ${JSON.stringify(err)}`);
				});
    });

		it('addRunDetails - 1st run for given deployment', () => {
      // const details = {
			// 	runId: 1,
			// 	provEngineId: 1001,
			// 	status: 'running',
			// };

      return db.addRunDetails(depId)
        .then((res) => {
          logger.info(`Add run details save response: ${JSON.stringify(res)}`);
          expect(res).to.not.be.null;
          expect(res._id).to.not.be.null;
          expect(res.deployment_id).to.equal(depId);
					expect(res.prov_engine_id).to.equal(1001);
					expect(res.status).to.equal('running');
					expect(res.submit_time).to.not.be.null;
        })
				.catch((err) => {
          logger.error(`Add run details save response error: ${JSON.stringify(err)}`);
				});
    });
		
		it('addRunDetails - 2nd run for given deployment', () => {
      const details = {
				runId: 2,
				provEngineId: 1002,
				status: 'running',
			};

      return db.addRunDetails(depId, details)
        .then((res) => {
          logger.info(`Add run details save response: ${JSON.stringify(res)}`);
          expect(res).to.not.be.null;
          expect(res._id).to.not.be.null;
          expect(res.deployment_id).to.equal(depId);
          expect(res.run_id).to.equal(details.runId);
					expect(res.prov_engine_id).to.equal(details.provEngineId);
					expect(res.status).to.equal(details.status);
					expect(res.submit_time).to.not.be.null;
        })
				.catch((err) => {
          logger.error(`Add run details save response error: ${JSON.stringify(err)}`);
				});
    });

		it('getAllRunDetails - verify all run details', () => {
      return db.getAllRunDetails(depId)
        .then((res) => {
          logger.info(`Get all run details response: ${JSON.stringify(res)}`);
          expect(res).to.not.be.null;
					expect(Object.keys(res).length).to.equal(2);
        })
				.catch((err) => {
          logger.error(`Get all run details response error: ${JSON.stringify(err)}`);
				});
    });

		it('getRunDetails - get 1st run details', () => {
      return db.getRunDetails(depId, 1)
        .then((res) => {
          logger.info(`Get run details response: ${JSON.stringify(res)}`);
          expect(res).to.not.be.null;
          expect(res[0].deployment_id).to.equal(depId);
          expect(res[0].run_id).to.equal(1);
					expect(res[0].prov_engine_id).to.equal(1001);
					expect(res[0].status).to.equal('running');
					expect(res[0].submit_time).to.not.be.null;
        })
				.catch((err) => {
          logger.error(`Get all run details response error: ${JSON.stringify(err)}`);
				});
    });

		it('searchDeployments - search using type', () => {
			const filter = {
        type: 'my_website-' + depId,
			};

      return db.searchDeployments(filter)
        .then((res) => {
          logger.info(`Search deployments response: ${JSON.stringify(res)}`);
          expect(res).to.not.be.null;
					expect(Object.keys(res).length).to.equal(2);
					expect(res[0].type).to.equal(filter.type);
        })
				.catch((err) => {
          logger.error(`Search deployment response error: ${JSON.stringify(err)}`);
				});
    });

		it('searchDeployments - search using owner', () => {
			const filter = {
        owner: 'some-owner-id-' + depId,
			};

      return db.searchDeployments(filter)
        .then((res) => {
          logger.info(`Search deployments response: ${JSON.stringify(res)}`);
          expect(res).to.not.be.null;
					expect(Object.keys(res).length).to.equal(1);
					expect(res[0].owner).to.equal(filter.owner);
        })
				.catch((err) => {
          logger.error(`Search deployment response error: ${JSON.stringify(err)}`);
				});
    });
	});
});
