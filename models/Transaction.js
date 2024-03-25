const db = require('../db/connection');

class Transaction {
    constructor(transactionId, userId, coinId, type, amount, price, timestamp) {
        this.transactionId = transactionId;
        this.userId = userId;
        this.coinId = coinId;
        this.type = type;
        this.amount = amount;
        this.price = price;
        this.timestamp = timestamp;
    }

    static async add(userId, coinId, type, amount, price) {
        try {
            const result = await db.query(
                `INSERT INTO transactions (user_id, coin_id, type, amount, price, timestamp) 
                VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *;`,
                [userId, coinId, type, amount, price]
            );
            const newTransaction = result.rows[0];
            return new Transaction(newTransaction.transaction_id, newTransaction.user_id, newTransaction.coin_id, newTransaction.type, newTransaction.amount, newTransaction.price, newTransaction.timestamp);
        } catch (error) {
            throw new Error(`Unable to add transaction: ${error.message}`);
        }
    }

    static async getByUserId(userId) {
        try {
            const result = await db.query(`SELECT * FROM transactions WHERE user_id = $1;`, [userId]);
            return result.rows.map(transaction => new Transaction(transaction.transaction_id, transaction.user_id, transaction.coin_id, transaction.type, transaction.amount, transaction.price, transaction.timestamp));
        } catch (error) {
            throw new Error(`Unable to retrieve transactions: ${error.message}`);
        }
    }

    static async getAll() {
        try {
            const result = await db.query(`SELECT * FROM transactions;`);
            return result.rows.map(transaction => new Transaction(transaction.transaction_id, transaction.user_id, transaction.coin_id, transaction.type, transaction.amount, transaction.price, transaction.timestamp));
        } catch (error) {
            throw new Error(`Unable to retrieve transactions: ${error.message}`);
        }
    }

    static async delete(transactionId) {
        try {
            const result = await db.query(`DELETE FROM transactions WHERE transaction_id = $1 RETURNING *;`, [transactionId]);
            return result.rowCount > 0;
        } catch (error) {
            throw new Error(`Unable to delete transaction: ${error.message}`);
        }
    }

}

module.exports = Transaction;
