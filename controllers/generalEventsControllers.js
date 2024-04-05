const moment = require('moment');
const GeneralEvent = require('../models/GeneralEvent');

exports.getEvents = async (req, res) => {
    try {
        const events = await GeneralEvent.getAllEvents(); // Fetch all events from your model

        // Format timestamps and calculate duration for each event
        const formattedEvents = events.map(event => {
            return {
                ...event,
                start_time: moment(event.start_time).format('LLLL'), // Format: 'Monday, May 29, 2024 2:00 PM'
                end_time: moment(event.end_time).format('LLLL'),
                duration: moment.duration(moment(event.end_time).diff(moment(event.start_time))).asMinutes() // Duration in minutes
            };
        });

        res.status(200).json(formattedEvents);
    } catch (error) {
        console.error('Error in getEvents:', error);
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
};

exports.addEvent = async (req, res) => {
    try {
        const newEvent = req.body; // Ensure proper validation
        const createdEvent = await GeneralEvent.addEvent(newEvent);
        res.status(201).json(createdEvent);
    } catch (error) {
        console.error('Error in addEvent:', error);
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
};