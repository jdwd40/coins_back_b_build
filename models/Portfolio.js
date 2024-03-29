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

    static async add(userId, coinId, amount, totalPrice) {
        // check if the user has enough funds
        console.log('totalPrice from add: ', totalPrice, amount);
        const user = await db.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (user.rows[0].funds < totalPrice) {
            return { "msg": "Insufficient funds" };
        } else {
            // update user's funds for a buy transaction
            const updatedFunds = await db.query('UPDATE users SET funds = funds - $1 WHERE user_id = $2 RETURNING *;', [totalPrice, userId]);
            const updatedUser = updatedFunds.rows[0];
            console.log('updatedUser: ', updatedUser);
        }
       

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

    
    /**
     * Updates the amount of a specific coin in a user's portfolio.
     * If the updated amount is 0, the coin entry is deleted from the portfolio.
     * @param {string} user_id - The ID of the user.
     * @param {string} coin_id - The ID of the coin.
     * @param {number} newAmount - The new amount of the coin.
     * @returns {object} - The updated portfolio entry or a message indicating deletion.
     */
    static async sell(user_id, coin_id, newAmount) {
        // check to see if use has this coin in their portfolio
        const existingPortfolio = await db.query('SELECT * FROM portfolios WHERE user_id = $1 AND coin_id = $2', [user_id, coin_id]);
        if (existingPortfolio.rows.length === 0) {
            return { "msg": "You do not own this coin" };
        }
        // update user's funds
        const user = await db.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
        const updatedFunds = await db.query('UPDATE users SET funds = funds + $1 WHERE user_id = $2 RETURNING *;', [newAmount, user_id]);
        const updatedUser = updatedFunds.rows[0];
        console.log('updatedUser: ', updatedUser);
        const result = await db.query(
            'UPDATE portfolios SET amount = amount - $1 WHERE user_id = $2 AND coin_id = $3 RETURNING *;',
            [newAmount, user_id, coin_id]
        );
        // check to see if there is amount 0, if so delete the row
        // change amount string to number
        const amount = Number(result.rows[0].amount);
        if (amount === 0) {
            await db.query('DELETE FROM portfolios WHERE user_id = $1 AND coin_id = $2', [user_id, coin_id]);
            return { "msg": "coin entry deleted"};
        }
        const updatedPortfolio = result.rows[0];
        return new Portfolio(updatedPortfolio.portfolio_id, updatedPortfolio.user_id, updatedPortfolio.coin_id, updatedPortfolio.amount);
    }

    static async delete(portfolioId) {
        const result = await db.query('DELETE FROM portfolios WHERE portfolio_id = $1 RETURNING *;', [portfolioId]);
        return result.rowCount > 0;
    }
}

module.exports = Portfolio;

