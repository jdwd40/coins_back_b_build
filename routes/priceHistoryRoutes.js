const express = require('express');
const phRouter = express.Router();
const phController = require('../controllers/priceHistoryControllers');

phRouter.get('/:id', phController.getPriceHistory);

// phRouter.post('/:id/prev', phController.getPrevPriceHistory);

module.exports = phRouter;