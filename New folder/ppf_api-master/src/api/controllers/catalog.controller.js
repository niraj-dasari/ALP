const httpStatus = require('http-status');
const { omit } = require('lodash');
const catalogService = require('../services/catalogService')
const logger = require('../../config/logger');

exports.create = async (req, res, next) => {
  try {
    logger.info("catalog.contoller :: create :: entered");
    const savedCatalog = await catalogService.createCatalog(req.body);
    res.status(httpStatus.CREATED);
    res.json(savedCatalog);
  } catch (error) {
    logger.error(`catalog.contoller :: create :: error :${error}`);
    next(error);
  }
};

exports.list = async (req, res, next) => {
  try {
    logger.info("catalog.contoller :: get :: entered");
    catalogs = await catalogService.getCatalogs();
    res.json(catalogs);
  } catch (error) {
    logger.error(`catalog.contoller :: get :: error :${error}`);
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    logger.info(`catalog.contoller :: get :: entered with catalogId = ${req.params.catalogId}`);
    catalog = await catalogService.getCatalog(req.params.catalogId);
    res.json(catalog);
  } catch (error) {
    logger.error(`catalog.contoller :: get :: error = ${error}`);
    next(error);
  }
};

exports.getByType = async (req, res, next) => {
  try {
    logger.info(`catalog.contoller :: getByType :: entered with type = ${req.params.type}`);
    catalog = await catalogService.getCatalogByType(req.params.type);
    res.json(catalog);
  } catch (error) {
    logger.error(`catalog.contoller :: getByType :: error = ${error}`);
    next(error);
  }
};
