const db = require('./connection');
const format = require('pg-format');

const seed = (seedData) => {
    const { users, portfolios, transactions, coins, price_history, generalEventsData, coinEventsData } = seedData; // Include transactions in your seed data
    // console.log('General Events Data:', generalEventsData);

    return db
        .query('DROP TABLE IF EXISTS transactions CASCADE;')
        .then(() => db.query('DROP TABLE IF EXISTS portfolios CASCADE;'))
        .then(() => db.query('DROP TABLE IF EXISTS users CASCADE;'))
        .then(() => db.query('DROP TABLE IF EXISTS coins CASCADE;'))
        .then(() => db.query('DROP TABLE IF EXISTS price_history CASCADE;'))
        .then(() => db.query('DROP TABLE IF EXISTS general_events CASCADE;'))
        .then(() => db.query('DROP TABLE IF EXISTS coin_events CASCADE;'))
        .then(() => db.query('DROP TABLE IF EXISTS market_stats CASCADE;')) // Drop market_stats table if exists
        .then(() => {
            return db.query(`
                CREATE TABLE users (
                    user_id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    funds NUMERIC(20, 2) DEFAULT 100.00,
                    date_created TIMESTAMP NOT NULL,
                    last_login TIMESTAMP NOT NULL,
                    profile_settings JSONB,
                    is_active BOOLEAN NOT NULL
                );`);
        })
        .then(() => {
            // Insert Users
            const formattedUsers = users.map(user => [
                user.username,
                user.email,
                user.passwordHash,
                user.funds,
                user.dateCreated,
                user.lastLogin,
                user.profileSettings,
                user.isActive
            ]);
            const sql = format(`
                INSERT INTO users 
                (username, email, password_hash, funds, date_created, last_login, profile_settings, is_active) 
                VALUES %L RETURNING *;`, formattedUsers
            );
            return db.query(sql);
        })
        .then(() => {
            // Create Portfolios Table
            return db.query(`
                CREATE TABLE portfolios (
                    portfolio_id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(user_id),
                    coin_id INTEGER NOT NULL, 
                    amount NUMERIC(20, 8) NOT NULL
                );`);
        })
        .then(() => {
            // Insert Portfolios
            const formattedPortfolios = portfolios.map(portfolio => [
                portfolio.userId,
                portfolio.coinId,
                portfolio.amount
            ]);
            const sql = format(`
                INSERT INTO portfolios 
                (user_id, coin_id, amount) 
                VALUES %L RETURNING *;`, formattedPortfolios
            );
            return db.query(sql);
        })
        .then(() => {
            // Create Transactions Table
            return db.query(`
                CREATE TABLE transactions (
                    transaction_id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(user_id),
                    coin_id INTEGER NOT NULL,
                    type VARCHAR(10) NOT NULL,
                    amount NUMERIC(20, 8) NOT NULL,
                    price NUMERIC(20, 8) NOT NULL,
                    timestamp TIMESTAMP NOT NULL
                );`);
        })
        .then(() => {
            // Insert Transactions
            const formattedTransactions = transactions.map(transaction => [
                transaction.userId,
                transaction.coinId,
                transaction.type,
                transaction.amount,
                transaction.price,
                transaction.timestamp
            ]);
            const sql = format(`
                INSERT INTO transactions 
                (user_id, coin_id, type, amount, price, timestamp) 
                VALUES %L RETURNING *;`, formattedTransactions
            );
            return db.query(sql);
        })
        .then(() => {
            return db.query(`
                CREATE TABLE coins (
                    coin_id SERIAL PRIMARY KEY,
                    name VARCHAR(255) UNIQUE NOT NULL,
                    symbol VARCHAR(10) UNIQUE NOT NULL,
                    current_price NUMERIC(4, 2) NOT NULL,
                    all_time_high NUMERIC(10, 2),
                    all_time_low NUMERIC(10, 2),
                    supply NUMERIC(10) NOT NULL,
                    market_cap NUMERIC(10) NOT NULL,
                    date_added TIMESTAMP NOT NULL,
                    description TEXT
                );`);
        })
        .then(() => {
            const formattedCoins = coins.map(coin => [
                coin.name,
                coin.symbol,
                coin.current_price,
                coin.all_time_high,
                coin.all_time_low,
                coin.supply,
                coin.market_cap,
                coin.date_added,
                coin.description
            ]);
            const sql = format(`
                INSERT INTO coins 
                (name, symbol, current_price, all_time_high, all_time_low, supply, market_cap, date_added, description) 
                VALUES %L RETURNING *;`,
                formattedCoins
            );
            return db.query(sql);
        })
        .then(() => {
            // Create Price History Table without all_time_high and all_time_low
            return db.query(`
                CREATE TABLE price_history (
                    history_id SERIAL PRIMARY KEY,
                    coin_id INTEGER NOT NULL REFERENCES coins(coin_id),
                    price NUMERIC NOT NULL,
                    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                );`);
        })
        .then(() => {
            // Insert Price History Data
            const formattedPriceHistory = price_history.map(entry => [
                entry.coin_id,
                entry.price,
                entry.timestamp
            ]);
            const sql = format(`
                INSERT INTO price_history 
                (coin_id, price, timestamp) 
                VALUES %L RETURNING *;`,
                formattedPriceHistory
            );
            return db.query(sql);
        })
        .then(() => {
            // Create General Events Table
            return db.query(`
                CREATE TABLE general_events (
                    event_id SERIAL PRIMARY KEY,
                    type VARCHAR(255) NOT NULL,
                    start_time TIMESTAMP NOT NULL,
                    end_time TIMESTAMP NOT NULL,
                    details JSONB
                );
            `);
        })
        .then(() => {
            // Insert General Events Data
            const formattedGeneralEvents = generalEventsData.map(event => [
                event.type,
                event.start_time,
                event.end_time,
                JSON.stringify(event.details)
            ]);
            const sqlGeneralEvents = format(`
                INSERT INTO general_events 
                (type, start_time, end_time, details) 
                VALUES %L RETURNING *;`,
                formattedGeneralEvents
            );
            return db.query(sqlGeneralEvents);
        })
        .then(() => {
            // Create Coin Events Table
            return db.query(`
            CREATE TABLE coin_events (
                event_id SERIAL PRIMARY KEY,
                coin_id INTEGER NOT NULL REFERENCES coins(coin_id),
                type VARCHAR(255) NOT NULL,
                is_positive BOOLEAN NOT NULL,
                impact VARCHAR(50) NOT NULL,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL
            );
        `);
        })
        .then(() => {
            // Insert Coin Events Data
            const formattedCoinEvents = coinEventsData.map(event => [
                event.coin_id,
                event.type,
                event.is_positive,
                event.impact,
                event.start_time,
                event.end_time
            ]);
            const sqlCoinEvents = format(`
                INSERT INTO coin_events 
                (coin_id, type, is_positive, impact, start_time, end_time) 
                VALUES %L RETURNING *;`,
                formattedCoinEvents
            );
            return db.query(sqlCoinEvents);
        })
        .then(() => {
            // Create Market Stats Table
            return db.query(`
                CREATE TABLE market_stats (
                    id SERIAL PRIMARY KEY,
                    all_time_high NUMERIC,
                    last_5mins_value NUMERIC,
                    last_10mins_value NUMERIC,
                    last_30mins_value NUMERIC,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
        })
        .then(() => {
            // Create an index on the coin_id column
            return db.query(`CREATE INDEX idx_price_history_coin_id ON price_history(coin_id);`);
        })
        .then(() => {
            // Create an index on the timestamp column
            return db.query(`CREATE INDEX idx_price_history_timestamp ON price_history(timestamp);`);
        });
};

module.exports = { seed };
