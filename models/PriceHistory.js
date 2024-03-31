// models/PriceHistory.js

const db = require('../db/connection');

class PriceHistory {
    constructor(coinId, price, timestamp) {
        this.coinId = coinId;
        this.price = price;
        this.timestamp = timestamp;
    }

    static async getByCoinId(coin_id, minutes = 30) {
        try {
            console.log(`coinId: ${coin_id}, minutes: ${minutes}`)
            const currentTime = new Date();
            const startTime = new Date(currentTime.getTime() - minutes * 60000); // Convert minutes to milliseconds
            const result = await db.query('SELECT * FROM price_history WHERE coin_id = $1 AND timestamp >= $2 ORDER BY timestamp ASC', [coin_id, startTime]);
            
            return result.rows;
        } catch (error) {
            throw new Error('Error fetching price history: ' + error.message);
        }
    }

    static async addEntry(coinId, price, timestamp = new Date()) {
        try {
            const result = await db.query(`
                INSERT INTO price_history (coin_id, price, timestamp) 
                VALUES ($1, $2, $3) 
                RETURNING *;
            `, [coinId, price, timestamp]);

            return result.rows[0];
        } catch (error) {
            throw new Error(`Error adding price history entry: ${error.message}`);
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

    static async getAveragePrice(coinId) {
        try {
            const result = await db.query('SELECT AVG(price) as avg FROM price_history WHERE coin_id = $1', [coinId]);
            return result.rows[0].avg;
        } catch (error) {
            throw new Error('Error fetching average price: ' + error.message);
        }
    }

}

module.exports = PriceHistory;
