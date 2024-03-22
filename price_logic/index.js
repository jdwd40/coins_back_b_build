const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const GeneralEvent = require('../models/GeneralEvent');

const db = require('../db/connection');

async function priceAdjust() {
    console.log(' ------------------------------------');
    console.log(' ------------------ Starting price adjustment process ------------------');
    try {
        const coins = await Coin.getAll();
        const marketTrend = await determineMarketTrend(); // Function to determine if it's bull or bear market
        console.log(`Market trend: ${marketTrend.type}`);
        const duration = (marketTrend.end_time - marketTrend.start_time) / (1000 * 60);
        console.log(`Market event duration: ${duration} minutes length`);
        const durationLeft = (marketTrend.end_time - new Date()) / (1000 * 60);
        console.log(`Time left for market event: ${durationLeft} minutes`);

        for (const coin of coins) {
            let newPrice = coin.current_price;

            // Apply market trend
            newPrice = await applyMarketTrend(newPrice, marketTrend.type);
            console.log(`Coin Price after market trend adjustment: ${coin.name} ${newPrice}`);

            // Check and apply coin-specific event
            const coinEvent = await checkCoinEvent(coin);
            console.log(`Coin event for ${coin.name}: ${coinEvent.event_type}
             `);

            if (coinEvent) {
                newPrice = await applyCoinEvent(newPrice, coinEvent);
                console.log(`Price after coin event adjustment: ${newPrice}`);
            }

            // Update new price in the database and price history
            await Coin.updatePriceById(coin.coin_id, newPrice);
            await PriceHistory.addEntry(coin.coin_id, newPrice);
        }

        console.log('Price adjustment completed successfully');
    } catch (error) {
        console.error(`Error during price adjustment: ${error.message}`);
    }
}

async function determineMarketTrend() {
    // Logic to determine market trend (bull or bear)
    // look at event table to see if there is a market event
    const marketEvent = await GeneralEvent.getCurrentEvent();
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
    const event = { type, start_time, end_time }
    // console.log(event.type);
    await GeneralEvent.addEvent(event);
    return event;
}

async function applyMarketTrend(newPrice, trendType) {
    // Adjust price based on market trend
    // loop thro coins and update price based on market trend
    // change newPrice into a number
    if (trendType === 'bull') {
        newPrice *= 1.1; // Increase price by 10%
    } else if (trendType === 'bear') {
        newPrice *= 0.9; // Decrease price by 10%
    }
    return newPrice;

}

async function checkCoinEvent(coin) {
    console.log(`Checking for coin event for ${coin.name}`);

    // Fetch all events for the coin
    const coinEvents = await Coin.getCoinEvent(coin.coin_id);

    // Find an event that is currently active
    const currentEvent = coinEvents.find(event => {
        const now = new Date();
        return now >= new Date(event.start_time) && now <= new Date(event.end_time);
    });

    // If an active event is found, return it
    if (currentEvent) {
        // log the duration of event left
        const duration = (currentEvent.end_time - currentEvent.start_time) / (1000 * 60);
        console.log(`Current event found for ${coin.name}: ${currentEvent.type} Event duration: ${duration} minutes`);
        return currentEvent;
    }

    // If no current event is found, create and return a new event
    console.log(`No current event found for ${coin.name}, creating a new event.`);
    return await createCoinEvent(coin.coin_id);
}


async function applyCoinEvent(price, event) {
    // Adjust price based on coin-specific event
    // loop through coins and update price based on coin event
    console.log(`Applying coin event - Type: ${event.event_type} impact: ${event.impact} is_positive: ${event.is_positive} Price: ${price}`);
    if (event.isPositive) {
        if (event.impact === 'high') {
            price *= 1.2; // Increase price by 20%
        } else if (event.impact === 'medium') {
            price *= 1.1; // Increase price by 10%
        } else if (event.impact === 'low') {
            price *= 1.05; // Increase price by 5%
        }
    } else if (event.isPositive === false) {
        if (event.impact === 'high') {
            price *= 0.8; // Decrease price by 20%
        } else if (event.impact === 'medium') {
            price *= 0.9; // Decrease price by 10%
        } else if (event.impact === 'low') {
            price *= 0.95; // Decrease price by 5%
        }
    }
    // update price for coin
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

    // Randomly choose between positive and negative events
    const eventType = Math.random() < 0.5 ? 'positive' : 'negative';
    const isPositive = eventType === 'positive';
    const selectedEvents = isPositive ? positiveEvents : negativeEvents;

    // Randomly select an event from the chosen array
    const eventIndex = Math.floor(Math.random() * selectedEvents.length);
    const selectedEvent = selectedEvents[eventIndex];

    // Current time
    const startTime = new Date();

    // Randomly determine the end time (1 to 15 minutes from start time)
    const durationInMinutes = Math.floor(Math.random() * 15) + 1;
    const endTime = new Date(startTime.getTime() + durationInMinutes * 60000); // Add duration to start time
    console.log(`Creating new event for coin_id ${coin_id}: ${selectedEvent.type} - ${isPositive ? 'Positive' : 'Negative'} - Impact: ${selectedEvent.impact} - Start: ${startTime} - End: ${endTime}`);

    // Construct the event object
    const event = {
        coin_id: coin_id,
        event_type: selectedEvent.type,
        is_positive: isPositive,
        impact: selectedEvent.impact,
        start_time: startTime,
        end_time: endTime
    };

    // Add the event to the database
    await Coin.addCoinEvent(event);

    return event;
}

// Example usage
createCoinEvent(1).then(event => {
    console.log(event); // Logs a randomly generated event for coin_id 1
});


priceAdjust();

module.exports = priceAdjust;
