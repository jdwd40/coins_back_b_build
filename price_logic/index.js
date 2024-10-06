// Import necessary models
const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const GeneralEvent = require('../models/GeneralEvent');

const PRICE_FLOOR = 0.1; // Define a price floor constant

async function priceAdjust() {
    console.log('------------------------------------');
    console.log('------------------ Starting price adjustment process ------------------');
    try {
        const coins = await Coin.getAll();
        const marketTrend = await determineMarketTrend();

        for (const coin of coins) {
            let newPrice = coin.current_price;

            // Apply market trend gradually
            newPrice = await applyMarketTrend(newPrice, marketTrend.type);

            // Add daily fluctuation
            const dailyFluctuation = (Math.random() - 0.5) * 0.01; // Random between -0.5% to +0.5%
            newPrice *= (1 + dailyFluctuation);

            // Check and apply coin-specific event
            const coinEvent = await checkCoinEvent(coin);
            if (coinEvent) {
                newPrice = await applyCoinEvent(newPrice, coinEvent);
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
    const events = ['bull', 'bear', 'bull', 'bear', 'bull', 'bear', 'boom', 'bust'];
    let type = events[Math.floor(Math.random() * events.length)];
    const duration = Math.floor(Math.random() * 21) + 5; // Random duration between 5 to 20 minutes
    const marketTotal = await Coin.getMarketTotal();
    if (marketTotal > 450) {
        type = 'bust';
    } else if (marketTotal < 150) {
        type = 'boom';
    }
    const start_time = new Date();
    const end_time = new Date(start_time.getTime() + duration * 60000); // Convert minutes to milliseconds
    const event = { type, start_time, end_time };
    await GeneralEvent.addEvent(event);
    return event;
}

async function applyMarketTrend(newPrice, trendType) {
    let percentageChange;
    const trendWeight = 0.25; // Apply 25% of trend effect per adjustment cycle

    if (trendType === 'bull') {
        percentageChange = Math.random() * 0.09 + 0.005; // Random between 0.5% and 9%
        newPrice += (trendWeight * (newPrice * percentageChange));
    } else if (trendType === 'bear') {
        percentageChange = Math.random() * 0.09 + 0.005; // Random between 0.5% and 9%
        newPrice -= (trendWeight * (newPrice * percentageChange));
    } else if (trendType === 'boom') {
        percentageChange = Math.random() * 0.05 + 0.1; // Random between 10% and 15%
        newPrice += (trendWeight * (newPrice * percentageChange));
    } else if (trendType === 'bust') {
        percentageChange = Math.random() * 0.05 + 0.1; // Random between 10% and 15%
        newPrice -= (trendWeight * (newPrice * percentageChange));
    }

    return newPrice;
}

async function checkCoinEvent(coin) {
    const coinEvents = await Coin.getCoinEvent(coin.coin_id);
    const currentEvent = coinEvents.find(event => {
        const now = new Date();
        return now >= new Date(event.start_time) && now <= new Date(event.end_time);
    });
    if (currentEvent) {
        return currentEvent;
    }
    return await createCoinEvent(coin.coin_id);
}

async function applyCoinEvent(price, event) {
    if (event.is_positive) {
        if (event.impact === 'high') {
            price *= 1.1; // Increase price by 10%
        } else if (event.impact === 'medium') {
            price *= 1.05; // Increase price by 5%
        } else if (event.impact === 'low') {
            price *= 1.01; // Increase price by 1%
        }
    } else {
        if (event.impact === 'high') {
            price *= 0.9; // Decrease price by 10%
        } else if (event.impact === 'medium') {
            price *= 0.95; // Decrease price by 5%
        } else if (event.impact === 'low') {
            price *= 0.99; // Decrease price by 1%
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