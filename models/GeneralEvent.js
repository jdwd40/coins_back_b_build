const db = require('../db/connection');

class GeneralEvent {
    static async getAll() {
        const result = await db.query(`SELECT * FROM general_events`);
        return result.rows;
    }

    static async getById(id) {
        const result = await db.query(`SELECT * FROM general_events WHERE event_id = $1`, [id]);
        return result.rows[0];
    }


    static async addEvent(event) {
        console.log('event from addEvent: ', event);
        const result = await db.query(`INSERT INTO general_events (type, start_time, end_time) VALUES ($1, $2, $3) RETURNING *`, [event.type, event.start_time, event.end_time]);
        return result.rows[0];
    }

    static async getCurrentEvent() {
        try {
            // Query to check if current time is within any event's duration
            const result = await db.query(`
                SELECT * FROM general_events 
                WHERE start_time <= CURRENT_TIMESTAMP AND end_time >= CURRENT_TIMESTAMP
                LIMIT 1;
            `);
    
            // If an event is found that matches the criteria, return it
            if (result.rows.length > 0) {
                const event = result.rows[0];
                return {
                    type: event.type,
                    start_time: event.start_time,
                    end_time: event.end_time,
                    details: event.details
                };
            } else {
                return null;
            }
        } catch (error) {
            throw new Error('Error fetching current event: ' + error.message);
        }
    }

    static async getAllEvents() {
        try {
            const currentDate = new Date();
            const result = await db.query(`
                SELECT * FROM general_events
                ORDER BY start_time DESC
            `);
            return result.rows;
        } catch (error) {
            throw new Error('Error fetching all events: ' + error.message);
        }
    }
}

module.exports = GeneralEvent;