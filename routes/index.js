const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes'); // Import user routes
const coinRoutes = require('./coinRoutes'); // Import coin routes

router.get('/', (req, res) => {
    res.send({"msg:": "ok"});
});

// Include user routes under a specific path, like '/users'
router.use('/users', userRoutes);

router.use('/coins', coinRoutes); // Include coin routes

module.exports = router;
