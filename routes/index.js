const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes'); 
const coinRoutes = require('./coinRoutes'); 
const priceHistoryRoutes = require('./priceHistoryRoutes'); 
const generalEventsRoutes = require('./generalEventsRoutes');
const portfolioRoutes = require('./portfolioRoutes');
const transactionRoutes = require('./transactionRoutes');

router.get('/', (req, res) => {
    res.send({"msg:": "ok"});
});

// Routes
router.use('/users', userRoutes);

router.use('/coins', coinRoutes); 

router.use('/history', priceHistoryRoutes); 

router.use('/events', generalEventsRoutes);

router.use('/portfolios', portfolioRoutes);

router.use('/transactions', transactionRoutes);

module.exports = router;
