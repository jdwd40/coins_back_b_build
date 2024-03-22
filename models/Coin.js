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
        // Logic to fetch all coins from the database
        const coins = await db.query('SELECT * FROM coins');
        return coins.rows;
    }

    static async getById(id) {
        // Logic to fetch a single coin by its ID
        const coin = await db.query('SELECT * FROM coins WHERE coin_id = $1', [id]);
        return coin.rows[0];
    }

    static async create(newCoinData) {
        // Logic to add a new coin to the database
        let { name, symbol, current_price, supply, market_cap, date_added, description } = newCoinData;
       // if date_added is not provided, use the current date
        if (!date_added) {
            date_added = new Date();
        }
        // if current_price is not provided, set it to random value between 5 - 100, same with supply 100 - 400 and market cap 1000 - 10000
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

        const newCoin = await db.query(`
            INSERT INTO coins (name, symbol, current_price, supply, market_cap, date_added, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `, [name, symbol, current_price, supply, market_cap, date_added, description]);
        
        return newCoin.rows[0];
    }

    static async updateById(id, updatedCoinData) {
        // Logic to update a coin's data in the database
        const { coin_id, name, symbol, current_price, supply, market_cap, date_added, description } = updatedCoinData;
        const updatedCoin = await db.query(`
            UPDATE coins
            SET coin_id = $1, name = $2, symbol = $3, current_price = $4, supply = $5, market_cap = $6, date_added = $7, description = $8
            WHERE coin_id = $9
            RETURNING *;
        `, [coin_id, name, symbol, current_price, supply, market_cap, date_added, description, id]);
    }

    static async updatePriceById(id, newPrice) {
        // Logic to update a coin's price in the database
        const updatedPrice = await db.query(`
            UPDATE coins
            SET current_price = $1
            WHERE coin_id = $2
            RETURNING *;
        `, [newPrice, id]);
        return updatedPrice.rows[0];
    }   

    static async deleteById(id) {
        // Logic to delete a coin from the database
        const result = await db.query('DELETE FROM coins WHERE coin_id = $1', [id]);
        return result.rows[0];
    }

    static async getCoinEvent(coinId) {
        // Logic to fetch the event associated with a specific coin
        const coin = await db.query('SELECT * FROM coin_events WHERE coin_id = $1', [coinId]);
        return coin.rows;
    }

    static async addCoinEvent(event) {
        // Logic to create a new event for a specific coin
        const newEvent = await db.query(`
            INSERT INTO coin_events (coin_id, type, impact, is_positive, start_time, end_time)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `, [event.coin_id, event.event_type, event.impact, event.is_positive, event.start_time, event.end_time]);
        return newEvent.rows[0];
    }
}

module.exports = Coin;
