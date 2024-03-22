const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const GeneralEvent = require('../models/GeneralEvent');

const db = require('../db/connection');

async function priceAdjust() {
    try {
        const coins = await Coin.getAll();
        const marketTrend = await determineMarketTrend(); // Function to determine if it's bull or bear market
        console.log(`Market trend: ${marketTrend.type}`);

        for (const coin of coins) {
            let newPrice = coin.current_price;

            // Apply market trend
            newPrice = await applyMarketTrend(newPrice, marketTrend.type);

            // Check and apply coin-specific event
            const coinEvent = await checkAndApplyCoinEvent(coin);
            if (coinEvent) {
                newPrice = applyCoinEvent(newPrice, coinEvent);
            }

            // Update new price in the database and price history
            await Coin.updatePriceById(coin.coin_id, newPrice);
            await PriceHistory.addEntry(coin.coin_id, newPrice);
        }

        console.log('Price adjustment completed successfully');
    } catch (error) {
        console.error(`Error during price adjustment: ${error.message}`);
    } finally {
        db.end();
    }
}

async function determineMarketTrend() {
    // Logic to determine market trend (bull or bear)
    // look at event table to see if there is a market event
    const marketEvent = await GeneralEvent.getCurrentEvent();
    console.log('from determinMarketTrend: ',marketEvent);
    // if there is a market event, return the name of the event market trend returns null then create a new market event
    if (marketEvent) {
        return marketEvent;
    } else {
        return await createMarketEvent();
    }
    
}

async function createMarketEvent() {
    // Logic to create a market event
    // randomly generate a market event, boom, bust, bull, bear, also generate a time range for the event between 5 - 15 minutes
    console.log('Creating new market event');
    const events = ['bull', 'bear'];
    const type = events[Math.floor(Math.random() * events.length)];
    const duration = Math.floor(Math.random() * 11) + 5; // Random duration between 5 to 15 minutes
    const start_time = new Date();
    const end_time = new Date(start_time.getTime() + duration * 60000); // Convert minutes to milliseconds
    const event = { type, start_time, end_time}
    console.log(event.type);
    await GeneralEvent.addEvent(event);
    return event;
}

async function applyMarketTrend(newPrice, trendType) {
    // Adjust price based on market trend
    // loop thro coins and update price based on market trend
    if (trendType === 'bull') {
        newPrice *= 1.1; // Increase price by 10%
    } else if (trendType === 'bear') {
        newPrice *= 0.9; // Decrease price by 10%
    }   
    return newPrice;

}

async function checkAndApplyCoinEvent(coin) {
    // Check for and apply any coin-specific events
}

function applyCoinEvent(price, event) {
    // Adjust price based on coin-specific event
}

priceAdjust();

module.exports = priceAdjust;
