const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const deploymentRoutes = require('./deployment.route');
const catalogRoutes = require('./catalog.route');
const accountRoutes = require('./account.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);

router.use('/deployments', deploymentRoutes);
router.use('/catalogs', catalogRoutes);
router.use('/accounts', accountRoutes);
module.exports = router;
