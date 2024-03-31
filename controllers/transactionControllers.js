const Transaction = require('../models/Transaction'); // Adjust the path as needed
const Coin = require('../models/Coin');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');

exports.handleTransaction = async (req, res) => {
    try {
        const { user_id, coin_id, type, amount } = req.body;

        // Basic validation
        if (!user_id || !coin_id || !type || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Convert amount to a number for calculation
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum)) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Get current coin price
        const current_price = await Coin.getPriceById(coin_id);
        const totalPrice = amountNum * current_price;
        console.log('totalPrice:', totalPrice);
        
        if (type === 'buy') {
            const fundsCheck = await User.checkFunds(user_id, totalPrice);
            console.log('fundsCheck:', fundsCheck);
            if (!fundsCheck) {
                return res.status(400).json({ message: "Not enough funds!" });
            }
            const buyResult = await Portfolio.add(user_id, coin_id, amountNum, totalPrice);
            if (buyResult.msg) {
                return res.status(400).json({ message: buyResult.msg });
            }
            const newUserFunds = await User.updateFundsAfterBuy(user_id, totalPrice);
            console.log('newUserFunds:', newUserFunds);
        } else if (type === 'sell') {
            const sellResult = await Portfolio.sell(user_id, coin_id, amountNum);
            if (sellResult.msg) {
                return res.status(400).json({ message: sellResult.msg });
            }
            const newUserFunds = await User.updateFundsAfterSell(user_id, totalPrice);
            console.log('newUserFunds:', newUserFunds);
        } else {
            return res.status(400).json({ message: 'Invalid transaction type' });
        }

        // Save the transaction
        await Transaction.add(user_id, coin_id, type, amountNum, current_price);
        res.status(201).json({ message: 'Transaction successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing transaction', error: error.message });
    }
};


exports.addTransaction = async (req, res) => {
    try {
        const { userId, coinId, type, amount, price } = req.body;

        // Validate data
        if (!userId || !coinId || !type || !amount || !price) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newTransaction = await Transaction.add(userId, coinId, type, amount, price);
        res.status(201).json({
            message: 'Transaction added successfully',
            transaction: newTransaction
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding transaction', error: error.message });
    }
};

exports.getTransactionsByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;

        const transactions = await Transaction.getByUserId(user_id);
        res.status(200).json({
            message: 'Transactions retrieved successfully',
            transactions: transactions
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving transactions', error: error.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.getAll();
        res.status(200).json({
            message: 'All transactions retrieved successfully',
            transactions: transactions
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving transactions', error: error.message });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { trans_id } = req.params;

        const deleted = await Transaction.delete(trans_id);
        if (deleted) {
            res.status(204).json({ message: 'Transaction deleted successfully' });
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting transaction', error: error.message });
    }
}
