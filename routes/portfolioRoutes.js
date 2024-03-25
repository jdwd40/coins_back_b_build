// portFolioRoutes.js

const express = require('express');
const pfRouter = express.Router();
const pfController = require('../controllers/portfolioControllers');

pfRouter.get('/:id', pfController.getUserPortfolio);

pfRouter.post('/', pfController.addToPortfolio);

pfRouter.put('/:user_id', pfController.updateAmountFromPortfolio);

module.exports = pfRouter;