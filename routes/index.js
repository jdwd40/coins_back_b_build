const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes'); 
const coinRoutes = require('./coinRoutes'); 
const priceHistoryRoutes = require('./priceHistoryRoutes'); 
const generalEventsRoutes = require('./generalEventsRoutes');

router.get('/', (req, res) => {
    res.send({"msg:": "ok"});
});

// Routes
router.use('/users', userRoutes);

router.use('/coins', coinRoutes); 

router.use('/priceHistory', priceHistoryRoutes); 

router.use('/events', generalEventsRoutes);

module.exports = router;
