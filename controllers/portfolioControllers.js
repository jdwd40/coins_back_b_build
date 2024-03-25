const Portfolio = require('../models/Portfolio');
const Coin = require('../models/Coin');

exports.getUserPortfolio = async (req, res) => {
    try {
        const id = req.params.id;
        const portfolio = await Portfolio.getByUserId(id);
        // calculate the total value of the portfolio, get current price and name from coins table
        let totalValue = 0;
        for (let i = 0; i < portfolio.length; i++) {
            const coin = portfolio[i];
            const coinId = coin.coin_id;
            const amount = coin.amount;
            const coinData = await Coin.getById(coinId);
            const price = coinData.current_price;
            const name = coinData.name;
            coin.name = name;
            coin.current_price = price;
            totalValue += price * amount;
        }
        portfolio.push({ totalValue });
        res.status(200).json(portfolio);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
    }
};

exports.addToPortfolio = async (req, res) => {
    try {
        const { user_id, coin_id, amount } = req.body;
        const newPortfolio = await Portfolio.add(user_id, coin_id, amount);
        res.status(201).json(newPortfolio);
    } catch (error) {
        res.status(500).json({ message: 'Error adding to portfolio', error: error.message });
    }
};

exports.updateAmountFromPortfolio = async (req, res) => {
    // reduces the amount of coins held if user sells some coins
    try {
        const { user_id } = req.params;
        const { coin_id, amount } = req.body;
        const updatedPortfolio = await Portfolio.update(user_id, coin_id, amount);
        res.status(200).json(updatedPortfolio);
    } catch (error) {
        res.status(500).json({ message: 'Error updating portfolio', error: error.message });
    }
};

exports.deleteFromPortfolio = async (req, res) => {
    // Implement logic to delete an entry from the portfolio
    // You'll need the portfolio ID to identify which entry to delete
};
