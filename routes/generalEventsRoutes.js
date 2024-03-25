const express = require('express');
const geRouter = express.Router();
const generalEventsController = require('../controllers/generalEventsControllers');

// Get all events
geRouter.get('/', generalEventsController.getEvents);

module.exports = geRouter;