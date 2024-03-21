const Coin = require('../models/Coin'); // adjust the path as needed
const PriceHistory = require('../models/PriceHistory'); // adjust the path as needed
const  db = require('../db/connection');

const randomPriceAdjustment = async () => {
    try {
        const coins = await Coin.getAll(); // Fetch all coins

        for (const coin of coins) {
            // Convert current price to number
            const currentPrice = parseFloat(coin.current_price);

            // Calculate new price (this is a simplistic random adjustment)
            const priceChange = (Math.random() - 0.5) * 2; // Random change between -1 and 1
            const newPrice = Math.max(currentPrice + priceChange, 0); // Ensure price doesn't go below 0

            // Update coin price in the database
            await Coin.updatePriceById(coin.coin_id, newPrice);

            // Record the price change in price history
            await PriceHistory.addEntry(coin.coin_id, newPrice);
        }
        console.log('Price adjustment completed successfully');
    } catch (error) {
        console.error(`Error during random price adjustment: ${error.message}`);
    } finally {
        db.end(); // Close the database connection
    }
};

// Call the function or export it to be used elsewhere
randomPriceAdjustment();
