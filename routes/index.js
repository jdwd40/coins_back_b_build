const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send({"msg:": "ok"});
});

// More routes can be added here

module.exports = router;
