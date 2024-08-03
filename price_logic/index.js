const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const GeneralEvent = require('../models/GeneralEvent');

const PRICE_FLOOR = 0.1; // Define a price floor constant

async function priceAdjust() {
    console.log(' ------------------------------------');
    console.log(' ------------------ Starting price adjustment process ------------------');
    try {
        const coins = await Coin.getAll();
        const marketTrend = await determineMarketTrend(); // Function to determine if it's a bull or bear market

        for (const coin of coins) {
            let newPrice = coin.current_price;

            // Apply market trend
            newPrice = await applyMarketTrend(newPrice, marketTrend.type);
            // console.log(`Coin Price after market trend adjustment: ${coin.name} ${newPrice}`);

            // Check and apply coin-specific event
            const coinEvent = await checkCoinEvent(coin);

            if (coinEvent) {
                newPrice = await applyCoinEvent(newPrice, coinEvent);
                // console.log(`Price after coin event adjustment: ${newPrice}`);
            }

            // Ensure prices don't fall below the minimum threshold
            newPrice = Math.max(newPrice, PRICE_FLOOR);

            // Update new price in the database and price history
            await Coin.updatePriceById(coin.coin_id, newPrice);
            await PriceHistory.addEntry(coin.coin_id, newPrice);
        }
    } catch (error) {
        console.error(`Error during price adjustment: ${error.message}`);
    }
}

async function determineMarketTrend() {
    const marketEvent = await GeneralEvent.getCurrentEvent();
    if (marketEvent.msg === 'no event') {
        return await createMarketEvent();
    } else {
        return marketEvent;
    }
}

async function createMarketEvent() {
    console.log('Creating new market event');
    const events = ['bull', 'bear', 'boom', 'bust', 'bull', 'bear'];
    let type = events[Math.floor(Math.random() * events.length)];
    const duration = Math.floor(Math.random() * 13) + 3; // Random duration between 3 to 12 minutes
    const marketTotal = await Coin.getMarketTotal();
    if (marketTotal > 150) {
        type = 'bear';
    } else if (marketTotal < 50) {
        type = 'bull';
    }
    const start_time = new Date();
    const end_time = new Date(start_time.getTime() + duration * 60000); // Convert minutes to milliseconds
    const event = { type, start_time, end_time };
    await GeneralEvent.addEvent(event);
    return event;
}

async function applyMarketTrend(newPrice, trendType) {
    if (trendType === 'bull') {
        newPrice *= 1.1; // Increase price by 10%
    } else if (trendType === 'bear') {
        newPrice *= 0.9; // Decrease price by 10%
    } else if (trendType === 'boom') {
        newPrice *= 1.2; // Increase price by 20%
    } else if (trendType === 'bust') {
        newPrice *= 0.8; // Decrease price by 20%
    }
    return newPrice;
}

async function checkCoinEvent(coin) {
    // console.log(`Checking for coin event for ${coin.name}`);
    const coinEvents = await Coin.getCoinEvent(coin.coin_id);
    const currentEvent = coinEvents.find(event => {
        const now = new Date();
        return now >= new Date(event.start_time) && now <= new Date(event.end_time);
    });
    if (currentEvent) {
        const duration = (currentEvent.end_time - currentEvent.start_time) / (1000 * 60);
        // console.log(`Current event found for ${coin.name}: ${currentEvent.type} Event duration: ${duration} minutes`);
        return currentEvent;
    }
    // console.log(`No current event found for ${coin.name}, creating a new event.`);
    return await createCoinEvent(coin.coin_id);
}

async function applyCoinEvent(price, event) {
    // console.log(`Applying coin event - Type: ${event.event_type} impact: ${event.impact} is_positive: ${event.is_positive} Price: ${price}`);
    if (event.is_positive) {
        if (event.impact === 'high') {
            price *= 1.2; // Increase price by 20%
        } else if (event.impact === 'medium') {
            price *= 1.1; // Increase price by 10%
        } else if (event.impact === 'low') {
            price *= 1.05; // Increase price by 5%
        }
    } else {
        if (event.impact === 'high') {
            price *= 0.8; // Decrease price by 20%
        } else if (event.impact === 'medium') {
            price *= 0.9; // Decrease price by 10%
        } else if (event.impact === 'low') {
            price *= 0.95; // Decrease price by 5%
        }
    }
    return price;
}

async function createCoinEvent(coin_id) {
    const positiveEvents = [
        { type: 'Technological Breakthrough', impact: 'high' },
        { type: 'Celebrity Endorsement', impact: 'medium' },
        { type: 'Strategic Partnership', impact: 'high' },
        { type: 'Favorable Regulation', impact: 'medium' },
        { type: 'New Milestone Achieved', impact: 'low' }
    ];

    const negativeEvents = [
        { type: 'Security Breach', impact: 'high' },
        { type: 'Regulatory Issues', impact: 'high' },
        { type: 'Internal Conflicts', impact: 'medium' },
        { type: 'Negative Media Coverage', impact: 'medium' },
        { type: 'Technical Setbacks', impact: 'low' }
    ];

    const eventType = Math.random() < 0.5 ? 'positive' : 'negative';
    const isPositive = eventType === 'positive';
    const selectedEvents = isPositive ? positiveEvents : negativeEvents;
    const eventIndex = Math.floor(Math.random() * selectedEvents.length);
    const selectedEvent = selectedEvents[eventIndex];

    const startTime = new Date();
    const durationInMinutes = Math.floor(Math.random() * 15) + 1;
    const endTime = new Date(startTime.getTime() + durationInMinutes * 60000);
    // console.log(`Creating new event for coin_id ${coin_id}: ${selectedEvent.type} - ${isPositive ? 'Positive' : 'Negative'} - Impact: ${selectedEvent.impact} - Start: ${startTime} - End: ${endTime}`);

    const event = {
        coin_id: coin_id,
        event_type: selectedEvent.type,
        is_positive: isPositive,
        impact: selectedEvent.impact,
        start_time: startTime,
        end_time: endTime
    };

    await Coin.addCoinEvent(event);
    return event;
}

priceAdjust();

module.exports = priceAdjust;
