const Portfolio = require('../models/Portfolio');
const  {fetchAndUpdateCoinDetails} = require('./utils/fetchAndUpdateCoinDetails');
exports.getUserPortfolio = async (req, res) => {
    try {
        const userId = req.params.id;
        const portfolio = await Portfolio.getByUserId(userId);
        let totalValue = 0;

        // Use Promise.all to process all coin entries concurrently
        const updatedPortfolio = await Promise.all(
            portfolio.map(async coin => {
                const updatedCoin = await fetchAndUpdateCoinDetails(coin);
                totalValue += updatedCoin.current_price * updatedCoin.amount;
                return updatedCoin;
            })
        );

        updatedPortfolio.push({ totalValue }); // Add total value as a separate entry
        res.status(200).json(updatedPortfolio);
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
