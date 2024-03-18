// controllers/coinsController.js

const Coin = require('../models/Coin');

exports.getAllCoins = async (req, res) => {
    try {
        const coins = await Coin.getAll();
        res.status(200).json(coins);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coins', error: error.message });
    }
};

exports.getCoinById = async (req, res) => {
    try {
        const id = req.params.id;
        const coin = await Coin.getById(id);
        if (!coin) {
            return res.status(404).json({ message: 'Coin not found' });
        }
        res.status(200).json(coin);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coin', error: error.message });
    }
};

exports.createCoin = async (req, res) => {
    try {
        const newCoin = req.body; // Ensure proper validation
        const createdCoin = await Coin.create(newCoin);
        res.status(201).json(createdCoin);
    } catch (error) {
        res.status(500).json({ message: 'Error creating coin', error: error.message });
    }

};

exports.updateCoin = async (req, res) => {
    try {
        const id = req.params.id;
        const coinData = req.body;
        const updatedCoin = await Coin.updateById(id, coinData);
        res.status(200).json(updatedCoin);
    } catch (error) {
        res.status(500).json({ message: 'Error updating coin', error: error.message });
    }
};

exports.deleteCoin = async (req, res) => {
    try {
        const id = req.params.id;
        await Coin.deleteById(id);
        res.status(204).send({"msg": "Coin deleted successfully " });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting coin', error: error.message });
    }
};

exports.updateCoinPrice = async (req, res) => {
    try {
        const id = req.params.id;
        const { newPrice } = req.body; // Assuming the new price is passed in request body
        const updatedCoin = await Coin.updatePriceById(id, newPrice);
        res.status(200).json(updatedCoin);
    } catch (error) {
        res.status(500).json({ message: 'Error updating coin price', error: error.message });
    }
};
