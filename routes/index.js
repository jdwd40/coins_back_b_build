const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes'); 
const coinRoutes = require('./coinRoutes'); 
const priceHistoryRoutes = require('./priceHistory'); 

router.get('/', (req, res) => {
    res.send({"msg:": "ok"});
});

// Routes
router.use('/users', userRoutes);

router.use('/coins', coinRoutes); 

router.use('/priceHistory', priceHistoryRoutes); 

module.exports = router;
