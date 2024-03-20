// models/PriceHistory.js

const db = require('../db/connection');

class PriceHistory {
    constructor(coinId, price, timestamp) {
        this.coinId = coinId;
        this.price = price;
        this.timestamp = timestamp;
    }

    static async getByCoinId(coinId) {
        try {
            const result = await db.query('SELECT * FROM price_history WHERE coin_id = $1 ORDER BY timestamp', [coinId]);
            return result.rows.map(row => new PriceHistory(row.coin_id, row.price, row.timestamp));
        } catch (error) {
            throw new Error('Error fetching price history: ' + error.message);
        }
    }

    static async addEntry(coinId, price) {
        try {
            const result = await db.query('INSERT INTO price_history (coin_id, price) VALUES ($1, $2) RETURNING *', [coinId, price]);
            const newRow = result.rows[0];
            return new PriceHistory(newRow.coin_id, newRow.price, newRow.timestamp);
        } catch (error) {
            throw new Error('Error adding price history entry: ' + error.message);
        }
    }

    static async getAllTimeHigh(coinId) {
        try {
            const result = await db.query('SELECT MAX(price) as ath FROM price_history WHERE coin_id = $1', [coinId]);
            return result.rows[0].ath;
        } catch (error) {
            throw new Error('Error fetching all-time high: ' + error.message);
        }
    }

    static async getAllTimeLow(coinId) {
        try {
            const result = await db.query('SELECT MIN(price) as atl FROM price_history WHERE coin_id = $1', [coinId]);
            return result.rows[0].atl;
        } catch (error) {
            throw new Error('Error fetching all-time low: ' + error.message);
        }
    }
}

module.exports = PriceHistory;
