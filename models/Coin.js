const db = require('../db/connection');

class Coin {
    constructor(id, name, symbol, currentPrice, marketCap, supply, bio) {
        this.id = id;
        this.name = name;
        this.symbol = symbol;
        this.currentPrice = currentPrice;
        this.marketCap = marketCap;
        this.supply = supply;
        this.bio = bio;
    }

    static async getAll() {
        const coins = await db.query('SELECT * FROM coins');
        return coins.rows;
    }

    static async getById(id) {
        const result = await db.query('SELECT * FROM coins WHERE coin_id = $1', [id]);
        return result.rows[0];
    }

    static async getByName(name) {
        const result = await db.query('SELECT * FROM coins WHERE name = $1', [name]);
        return result.rows[0];
    }

    static async getBySymbol(symbol) {
        const result = await db.query('SELECT * FROM coins WHERE symbol = $1', [symbol]);
        return result.rows[0];
    }

    static async getAllTimeHigh(id) {
        const result = await db.query('SELECT all_time_high FROM coins WHERE coin_id = $1', [id]);
        return Number(result.rows[0].all_time_high);
    }

    static async updateAllTimeHigh(id, newHigh) {
        const result = await db.query('UPDATE coins SET all_time_high = $1 WHERE coin_id = $2 RETURNING *', [newHigh, id]);
        return result.rows[0];
    }

    static async updateAllTimeLow(id, newLow) {
        const result = await db.query('UPDATE coins SET all_time_low = $1 WHERE coin_id = $2 RETURNING *', [newLow, id]);
        return result.rows[0];
    }

    static async updatePriceById(id, newPrice) {
        console.log('Updating price for coin with ID:', id, 'with new price:', newPrice);

        // Fetch the current coin data
        const coin = await this.getById(id);
        if (!coin) {
            console.log('Coin not found for ID:', id);
            throw new Error('Coin not found');
        }

        let { all_time_high, all_time_low } = coin;
        all_time_high = all_time_high !== null ? parseFloat(all_time_high) : -Infinity;
        all_time_low = all_time_low !== null ? parseFloat(all_time_low) : Infinity;

        console.log('Initial values - All Time High:', all_time_high, 'All Time Low:', all_time_low);

        // Check and update all-time high
        if (newPrice > all_time_high) {
            console.log('Updating all-time high:', newPrice);
            all_time_high = newPrice;
        }

        // Check and update all-time low
        if (newPrice < all_time_low || all_time_low === null) {
            console.log('Updating all-time low:', newPrice);
            all_time_low = newPrice;
        }

        console.log('New values - All Time High:', all_time_high, 'All Time Low:', all_time_low);

        // Update the current price and all-time high/low in the database
        const result = await db.query(
            'UPDATE coins SET current_price = $1, all_time_high = $2, all_time_low = $3 WHERE coin_id = $4 RETURNING *',
            [newPrice, all_time_high, all_time_low, id]
        );

        if (result.rows.length === 0) {
            console.error('Failed to update coin price in database.');
            throw new Error('Failed to update coin price');
        }

        console.log('Update result:', result.rows[0]);
        return result.rows[0];
    }

    static async getPriceById(id) {
        try {
            const result = await db.query('SELECT current_price FROM coins WHERE coin_id = $1', [id]);
            if (result.rows.length === 0) {
                throw new Error(`Coin with ID ${id} not found`);
            }
            return Number(result.rows[0].current_price);
        } catch (error) {
            console.error(`Error fetching price for coin ID ${id}: ${error.message}`);
            throw error;
        }
    }

    static async create(newCoinData) {
        let { name, symbol, current_price, supply, market_cap, date_added, description } = newCoinData;
        if (!date_added) {
            date_added = new Date();
        }
        if (!current_price) {
            current_price = Math.random() * (100 - 5) + 5;
        }
        if (!supply) {
            supply = Math.random() * (400 - 100) + 100;
        }
        if (!market_cap) {
            market_cap = Math.random() * (10000 - 1000) + 1000;
        }
        if (!description) {
            description = 'No description provided';
        }

        const result = await db.query(
            'INSERT INTO coins (name, symbol, current_price, supply, market_cap, date_added, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, symbol, current_price, supply, market_cap, date_added, description]
        );

        return result.rows[0];
    }

    static async updateById(id, updatedCoinData) {
        const { name, symbol, current_price, supply, market_cap, date_added, description } = updatedCoinData;
        const result = await db.query(
            'UPDATE coins SET name = $1, symbol = $2, current_price = $3, supply = $4, market_cap = $5, date_added = $6, description = $7 WHERE coin_id = $8 RETURNING *',
            [name, symbol, current_price, supply, market_cap, date_added, description, id]
        );
        return result.rows[0];
    }

    static async deleteById(id) {
        const result = await db.query('DELETE FROM coins WHERE coin_id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    static async getCoinEvent(coinId) {
        const result = await db.query('SELECT * FROM coin_events WHERE coin_id = $1', [coinId]);
        return result.rows;
    }

    static async addCoinEvent(event) {
        const result = await db.query(
            'INSERT INTO coin_events (coin_id, type, impact, is_positive, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [event.coin_id, event.event_type, event.impact, event.is_positive, event.start_time, event.end_time]
        );
        return result.rows[0];
    }

    static async getMarketTotal() {
        try {
            const result = await db.query('SELECT SUM(current_price) FROM coins');
            if (!result.rows[0]) {
                throw new Error('Unable to calculate market total');
            }
            return Number(result.rows[0].sum);
        } catch (error) {
            console.error(`Error calculating market total: ${error.message}`);
            throw error;
        }
    }

    static async getTop3Coins() {
        try {
            const result = await db.query('SELECT * FROM coins ORDER BY current_price DESC LIMIT 3');
            return result.rows;
        } catch (error) {
            console.error(`Error fetching top 3 coins: ${error.message}`);
            throw error;
        }
    }
}

module.exports = Coin;