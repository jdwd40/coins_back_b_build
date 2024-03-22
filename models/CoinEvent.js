const db = require('../db/connection');

class CoinEvent {
    static async getAll() {
        const result = await db.query(`SELECT * FROM coin_events`);
        return result.rows;
    }

    static async getById(id) {
        const result = await db.query(`SELECT * FROM coin_events WHERE event_id = $1`, [id]);
        return result.rows[0];
    }

    static async addEntry(event) {
        const result = await db.query(`INSERT INTO coin_events (event_name, event_description, event_date) VALUES ($1, $2, $3) RETURNING *`, [event.event_name, event.event_description, event.event_date]);
        return result.rows[0];
    }

    static async getCurrentEvent() {
        const result = await db.query(`SELECT * FROM coin_events WHERE end_time > CURRENT_TIMESTAMP`);
        return result.rows;
    }
}

module.exports = CoinEvent;