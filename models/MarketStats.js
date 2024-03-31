const db = require('../db/connection');

class MarketStats {
    static async getMarketValue() {
        try {
            // Get the value of coins table current price
            const { rows } = await db.query(`
                SELECT SUM(current_price) AS market_value
                FROM coins
            `);
            return rows[0].market_value;
        } catch (error) {
            console.error('Error retrieving market value:', error);
            throw error;
        }
    }

    static async getLast5minsMarketValue() {
        try {
            const fiveMinutesAgo = new Date(new Date().getTime() - 5 * 60000); // 5 minutes ago

            const { rows } = await db.query(`
                SELECT SUM(closest_prices.price) AS market_value
                FROM (
                    SELECT coin_id, price,
                           ROW_NUMBER() OVER (PARTITION BY coin_id ORDER BY ABS(EXTRACT(EPOCH FROM timestamp - $1))) as rn
                    FROM price_history
                ) AS closest_prices
                WHERE closest_prices.rn = 1
            `, [fiveMinutesAgo]);
            console.log('Market value from 5 mins ago:', rows);
            return rows[0].market_value;
        } catch (error) {
            console.error('Error retrieving market value:', error);
            throw error;
        }
    }

    static async getLast10minsMarketValue() {
        try {
            const tenMinutesAgo = new Date(new Date().getTime() - 10 * 60000); // 10 minutes ago

            const { rows } = await db.query(`
                SELECT SUM(closest_prices.price) AS market_value
                FROM (
                    SELECT coin_id, price,
                           ROW_NUMBER() OVER (PARTITION BY coin_id ORDER BY ABS(EXTRACT(EPOCH FROM timestamp - $1))) as rn
                    FROM price_history
                ) AS closest_prices
                WHERE closest_prices.rn = 1
            `, [tenMinutesAgo]);
            return rows[0].market_value;
        } catch (error) {
            console.error('Error retrieving market value:', error);
            throw error;
        }
    }

    static async getLast30minsMarketValue() {
        try {
            const thirtyMinutesAgo = new Date(new Date().getTime() - 30 * 60000); // 30 minutes ago

            const { rows } = await db.query(`
                SELECT SUM(closest_prices.price) AS market_value
                FROM (
                    SELECT coin_id, price,
                           ROW_NUMBER() OVER (PARTITION BY coin_id ORDER BY ABS(EXTRACT(EPOCH FROM timestamp - $1))) as rn
                    FROM price_history
                ) AS closest_prices
                WHERE closest_prices.rn = 1
            `, [thirtyMinutesAgo]);
            return rows[0].market_value;
        } catch (error) {
            console.error('Error retrieving market value:', error);
            throw error;
        }
    }
}

module.exports = MarketStats;
