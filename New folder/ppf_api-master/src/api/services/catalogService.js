const dbFactory = require('../db/factory');
const logger = require('../../config/logger');
const db = dbFactory.getDB();
const httpStatus = require('http-status');

module.exports = {

  async createCatalog(catalog) {
    try {
      logger.info(`catalogService :: createCatalog :: entered`);
			const exists = await db.getCatalogByType(catalog.type);
			if (exists && exists.type == catalog.type) {
				throw new APIError({
					status: httpStatus.CONFLICT,
					message: 'Catalog type already exists',
				})
			}

			return await db.saveCatalog(catalog);
    } catch (error) {
      return db.checkForCatalogDuplicateField(error);
    }
  },

  async getCatalogs() {
    logger.info(`catalogService :: getCatalogs :: entered`);
    return await db.getCatalogs();
  },

  async getCatalogById(id) {
    logger.info(`catalogService :: getCatalog :: entered with id = ${id}`);
    return await db.getCatalog(id);
  },


  async getCatalogByType(type) {
    logger.info(`catalogService :: getCatalogByType :: entered with _id ${type}`)
    return await db.getCatalogByType(type)
  },

}
