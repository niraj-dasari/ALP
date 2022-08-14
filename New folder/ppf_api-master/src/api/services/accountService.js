const dbFactory = require('../db/factory');
const logger = require('../../config/logger');
const db = dbFactory.getDB();

module.exports = {
	async createAccount(account) {
		try {
			logger.info(`accountService :: createDeployment :: account = ${JSON.stringify(account)}`);
			if (!account.is_default) {
				account.is_default = false
			}

			return await db.saveAccount(account);
		} catch (error) {
			return db.checkForAccountDuplicateField(error);
		}
	},

	async getAllAccounts() {
		logger.info(`accountService :: getAllAccounts :: entered`);
		return await db.getAccounts();
	},

	async getAccountByAccountId(accountId) {
		logger.info(`accountService :: getAccountByAccountId :: entered, with accountId ${accountId}`);
		return await db.getAccountByAccountId(accountId);
	},

}
