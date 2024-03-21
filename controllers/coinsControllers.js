// controllers/coinsController.js
const PriceHistory = require('../models/PriceHistory');

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

        coin.priceHistory = await PriceHistory.getByCoinId(id);
        coin.allTimeHigh = await PriceHistory.getAllTimeHigh(id);
        coin.allTimeLow = await PriceHistory.getAllTimeLow(id);
        // calculate median average
        coin.priceHistory.sort((a, b) => a.price - b.price);
        const mid = Math.floor(coin.priceHistory.length / 2);
        coin.medianAverage = coin.priceHistory.length % 2 !== 0 ? coin.priceHistory[mid].price : (coin.priceHistory[mid - 1].price + coin.priceHistory[mid].price) / 2;

        if (!coin.priceHistory || coin.priceHistory.length === 0) {
            coin.meanAverage = null;
            coin.medianAverage = null;
        } else {
            const prices = coin.priceHistory.map(entry => Number(entry.price));
            console.log("Prices:", prices); // Check the converted prices

            const sum = prices.reduce((acc, price) => {
                const updatedAcc = acc + price;
                console.log(`Current price: ${price}, Updated accumulator: ${updatedAcc}`);
                return updatedAcc;
            }, 0);
            console.log("Sum:", sum); // Check the sum

            coin.meanAverage = sum / prices.length;
            console.log("Mean Average:", coin.meanAverage); // Check the calculated average
            // ... rest of your code ...
        }


        res.status(200).json(coin);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coin', error: error.message });
    }
};




exports.getPriceHistory = async (req, res) => {
    try {
        const id = req.params.id;
        const coin = await Coin.getById(id);
        if (!coin) {
            return res.status(404).json({ message: 'Coin not found' });
        }
        const priceHistory = await PriceHistory.getByCoinId(id);
        res.status(200).json(priceHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching price history', error: error.message });
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
        res.status(204).send({ message: "Coin deleted successfully " });
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
