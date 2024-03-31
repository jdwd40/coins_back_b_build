const db = require('../db/connection');

class Portfolio {
    constructor(portfolio_id, user_id, coin_id, amount) {
        this.portfolio_id = portfolio_id;
        this.user_id = user_id;
        this.coin_id = coin_id;
        this.amount = amount;
    }

    static async getByUserId(userId) {
        const result = await db.query('SELECT * FROM portfolios WHERE user_id = $1', [userId]);
        return result.rows.map(row => new Portfolio(row.portfolio_id, row.user_id, row.coin_id, row.amount));
    }

    static async add(userId, coinId, amount) {
        const existingPortfolio = await db.query('SELECT * FROM portfolios WHERE user_id = $1 AND coin_id = $2', [userId, coinId]);
        if (existingPortfolio.rows.length > 0) {
            const updatedPortfolio = await db.query(
                'UPDATE portfolios SET amount = amount + $1 WHERE user_id = $2 AND coin_id = $3 RETURNING *;',
                [amount, userId, coinId]
            );
            return new Portfolio(updatedPortfolio.rows[0].portfolio_id, updatedPortfolio.rows[0].user_id, updatedPortfolio.rows[0].coin_id, updatedPortfolio.rows[0].amount);
        } else {
            const result = await db.query(
                'INSERT INTO portfolios (user_id, coin_id, amount) VALUES ($1, $2, $3) RETURNING *;',
                [userId, coinId, amount]
            );
            const newPortfolio = result.rows[0];
            return new Portfolio(newPortfolio.portfolio_id, newPortfolio.user_id, newPortfolio.coin_id, newPortfolio.amount);
        }
    }

    static async sell(userId, coinId, newAmount) {

        const hasEnoughCoins = await Portfolio.checkAmount(userId, coinId, newAmount);
        if (!hasEnoughCoins) {
            return { msg: 'Invalid Amount - Not Enough Coins to Sell' };
        }

        const result = await db.query(
            'UPDATE portfolios SET amount = amount - $1 WHERE user_id = $2 AND coin_id = $3 RETURNING *;',
            [newAmount, userId, coinId]
        );
        if (result.rows.length === 0) {
            return null; // No portfolio found to update
        }
        const updatedPortfolio = result.rows[0];
        const amountCheck = Number(updatedPortfolio.amount)
        // if portfolio amount is 0 then delete the portfolio entry
        if (amountCheck === 0) {
            await Portfolio.delete(updatedPortfolio.portfolio_id);
            return { msg: 'Portfolio entry deleted' };
        } else if (amountCheck < 0) {
            return { msg: 'Invalid Amount - Not Enough Coins to Sell' };
        }
        return new Portfolio(updatedPortfolio.portfolio_id, updatedPortfolio.user_id, updatedPortfolio.coin_id, updatedPortfolio.amount);
    }

    static async delete(portfolioId) {
        const result = await db.query('DELETE FROM portfolios WHERE portfolio_id = $1 RETURNING *;', [portfolioId]);
        return result.rowCount > 0;
    }

    static async checkAmount(userId, coinId, amount) {
        const result = await db.query('SELECT amount FROM portfolios WHERE user_id = $1 AND coin_id = $2', [userId, coinId]);
        if (result.rows.length === 0) {
            return false;
        }
        return result.rows[0].amount >= amount;
    }
}

module.exports = Portfolio;

