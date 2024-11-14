// controllers/coinsController.js
const moment = require('moment');
const PriceHistory = require('../models/PriceHistory');
const GeneralEvent = require('../models/GeneralEvent');
const Coin = require('../models/Coin');
const CoinEvent = require('../models/CoinEvent');
const MarketStats = require('../models/MarketStats');
const Portfolio = require('../models/Portfolio');

exports.getAllCoins = async (req, res) => {
    try {
        const coins = await Coin.getAll();
        // const marketTotal = await Coin.getMarketTotal();
        // console.log("Market Total:", marketTotal);
        // const currentEvent = await GeneralEvent.getCurrentEvent();
        // use moment to convert start_time and end_time to human readable format
        // currentEvent.start_time = moment(currentEvent.start_time).format('LLLL');
        // currentEvent.end_time = moment(currentEvent.end_time).format('LLLL');
        // coins.push({ marketTotal, currentEvent });
        console.log("______________________ ----------------- ++++++++++++++ Coins, from controller:", coins);
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
        coin.last5minsValue = Number(await PriceHistory.getLast5minsValueByCoinId(id)).toFixed(2);
        coin.percentage5mins = ((coin.current_price - coin.last5minsValue) / coin.last5minsValue * 100).toFixed(2) + '%';
        coin.last10minsValue = Number(await PriceHistory.getLast10minsValueByCoinId(id)).toFixed(2);
        coin.percentage10mins = ((coin.current_price - coin.last10minsValue) / coin.last10minsValue * 100).toFixed(2) + '%';
        coin.last30minsValue = Number(await PriceHistory.getLast30minsValueByCoinId(id)).toFixed(2);
        coin.percentage30mins = ((coin.current_price - coin.last30minsValue) / coin.last30minsValue * 100).toFixed(2) + '%';

        if (!coin.priceHistory || coin.priceHistory.length === 0) {
            coin.meanAverage = null;
            coin.medianAverage = null;
        } else {
            const prices = coin.priceHistory.map(entry => Number(entry.price));
            //console.log("Prices:", prices); // Check the converted prices

            const sum = prices.reduce((acc, price) => {
                const updatedAcc = acc + price;
                // console.log(`Current price: ${price}, Updated accumulator: ${updatedAcc}`);
                return updatedAcc;
            }, 0);
            // console.log("Sum:", sum); // Check the sum

            coin.meanAverage = sum / prices.length;
            // console.log("Mean Average:", coin.meanAverage); // Check the calculated average
            // ... rest of your code ...
            // get coin event 
            const coinEvent = await CoinEvent.getCurrentEvent(id);
            console.log("***** LOG: from get current event --- Coin Event:", coinEvent);
            // calculate duration left from start time to end time
            const currentTime = Date.now();
            const eventEndTime = coinEvent[0].end_time;
            const remainingTime = eventEndTime - currentTime;
            const remainingMinutes = Math.floor(remainingTime / 60000);
            const remainingSeconds = Math.floor((remainingTime % 60000) / 1000);
            coin.eventDuration = `${remainingMinutes} mins ${remainingSeconds} secs`;

            coin.eventType = coinEvent[0].type;
            coin.coinEventPositive = coinEvent[0].is_positive;
            coin.eventImpact = coinEvent[0].impact;

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
        const { newPrice } = req.body; // the new price is passed in request body
        const numericNewPrice = Number(newPrice); // convert newPrice to number

        // Update the current price and check for all-time high/low
        const updatedCoin = await Coin.updatePriceById(id, numericNewPrice);

        res.status(200).json(updatedCoin);
    } catch (error) {
        res.status(500).json({ message: 'Error updating coin price', error: error.message });
    }
};

exports.getCoinEventsById = async (req, res) => {
    try {
        const id = req.params.id;
        const coinEvents = await CoinEvent.getById(id);
        console.log("Coin Events:", coinEvents);

        const formattedCoinEvents = coinEvents.map(event => ({
            ...event,
            start_time: moment(event.start_time).format('LLLL'), // Format to human-readable time
            end_time: moment(event.end_time).format('LLLL'),
            duration: moment.duration(moment(event.end_time).diff(moment(event.start_time))).humanize() // Duration in human-readable format (e.g., '2 hours', 'a day')
        }));

        res.status(200).json(formattedCoinEvents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coin events', error: error.message });
    }
};

exports.getCoinPrice = async (req, res) => {
    try {
        const id = req.params.id;
        const coin = await Coin.getById(id);
        if (!coin) {
            return res.status(404).json({ message: 'Coin not found' });
        }
        const currentPrice = Number(coin.current_price);
        res.status(200).json({ current_price: currentPrice });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching price', error: error.message });
    }
}

exports.setCoinPrice = async (req, res) => {
    try {
        const { coin_id, current_price } = req.body;
        // convert current_price from a string to a currency value
        // e.g., '100.00' -> 100.00
        const currentPrice = Number(current_price);


        const updatedCoin = await Coin.updatePriceById(coin_id, currentPrice);
        res.status(200).json(updatedCoin);
    } catch (error) {
        res.status(500).json({ message: 'Error setting price', error: error.message });
    }
}