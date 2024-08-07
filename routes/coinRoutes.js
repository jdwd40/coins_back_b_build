// routes/coinsRoutes.js

const express = require('express');
const router = express.Router();
const coinsController = require('../controllers/coinsControllers');

// Get all coins
router.get('/', coinsController.getAllCoins);

// Get a single coin by ID
router.get('/:id', coinsController.getCoinById);

router.get('/:id/priceHistory', coinsController.getPriceHistory);

// Create a new coin
router.post('/', coinsController.createCoin);

// Update an existing coin
router.put('/:id', coinsController.updateCoin);

// Delete a coin
router.delete('/:id', coinsController.deleteCoin);

// Update coin price
router.patch('/:id/setprice', coinsController.updateCoinPrice);

router.get('/:id/events', coinsController.getCoinEventsById);

router.get('/:id/getprice', coinsController.getCoinPrice);

router.put('/setprice', coinsController.setCoinPrice);

module.exports = router;
