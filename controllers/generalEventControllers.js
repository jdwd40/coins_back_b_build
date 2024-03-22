const GeneralEvent = require('../models/GeneralEvent');

exports.returnCurrentEvent = async () => {
    try {
        const events = await GeneralEvent.getCurrentEvent();
        return events;
    } catch (error) {
        return error;
    }
}