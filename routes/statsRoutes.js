const express = require('express');
const statsRouter = express.Router();
const statsController = require('../controllers/statsControllers');

statsRouter.get('/', statsController.getStats);

module.exports = statsRouter;