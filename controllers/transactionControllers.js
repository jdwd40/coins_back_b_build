const Transaction = require('../models/Transaction'); // Adjust the path as needed

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
