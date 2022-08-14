const httpStatus = require('http-status');
const { omit } = require('lodash');
const logger = require('../../config/logger');
const accountService = require('../services/accountService')

exports.get = async (req, res, next) => {
  try {
    logger.info(`account.contoller :: get :: entered with accountId = ${req.params.accountId}`);
    const account = await accountService.getAccountByAccountId(req.params.accountId);
    res.json(account);
  } catch (error) {
    logger.info(`account.contoller :: get :: error = ${error}`);
    return next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    logger.info(`account.contoller :: get_all :: entered`);
    const account = await accountService.getAllAccounts();
    res.json(account);
  } catch (error) {
    logger.info(`account.contoller :: get_all :: error :${error}`);
    return next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    logger.info("account.contoller :: create :: entered");
    const savedAccount = await accountService.createAccount(req.body);
    res.status(httpStatus.CREATED);
    res.json(savedAccount);
  } catch (error) {
    logger.info(`account.contoller :: create :: error :${error}`);
    next(error);
  }
};
