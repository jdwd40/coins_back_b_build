const express = require('express');
const phRouter = express.Router();
const phController = require('../controllers/priceHistoryControllers');

phRouter.get('/:id', phController.getPriceHistory);

module.exports = phRouter;