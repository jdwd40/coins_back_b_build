// transRouter is the router object for the transaction routes

const express = require('express');
const transRouter = express.Router();
const transController = require('../controllers/transactionControllers');

// Get all transactions
transRouter.get('/', transController.getAllTransactions);

// Get a single transaction by ID
transRouter.get('/:user_id', transController.getTransactionsByUserId);

// Create a new transaction
transRouter.post('/', transController.addTransaction);

// delete a transaction
transRouter.delete('/:trans_id', transController.deleteTransaction);

module.exports = transRouter;