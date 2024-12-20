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

    static async getAllTimeHighMarketValue() {
        try {
            // Get the current market value
            const currentMarketValue = await this.getMarketValue();

            // Get the all-time high market value from the market_stats table
            const { rows } = await db.query(`
                SELECT MAX(all_time_high) AS all_time_high_market_value
                FROM market_stats
            `);
            const allTimeHighMarketValue = rows[0].all_time_high_market_value;

            // Compare the current market value with the all-time high market value
            if (currentMarketValue > allTimeHighMarketValue) {
                // Update the market_stats table with the new all-time high market value
                await db.query(`
                    INSERT INTO market_stats (all_time_high, updated_at)
                    VALUES ($1, NOW())
                `, [currentMarketValue]);
                console.log('All-time high market value updated to:', currentMarketValue);

                // Return the current market value
                return currentMarketValue;
            } else {
                // Return the all-time high market value from the database
                return allTimeHighMarketValue;
            }
        } catch (error) {
            console.error('Error retrieving all-time high market value:', error);
            throw error;
        }
    }

    static async getAllTimeLow() {
        try {
            const { rows } = await db.query(`
                SELECT MIN(total_market_cap) AS all_time_low_market_cap
                FROM (
                    SELECT SUM(price) AS total_market_cap
                    FROM price_history
                    GROUP BY timestamp
                ) AS grouped_market_caps
            `);
            return rows[0].all_time_low_market_cap;
        } catch (error) {
            console.error('Error retrieving all time low market cap:', error);
            throw error;
        }
    }
}

module.exports = MarketStats;
