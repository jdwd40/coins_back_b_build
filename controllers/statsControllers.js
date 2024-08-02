const moment = require('moment');
const MarketStats = require('../models/MarketStats');
const GeneralEvent = require('../models/GeneralEvent');
const Coin = require('../models/Coin');

exports.getStats = async (req, res) => {
    // calculate market value
    const marketValue = Number(await MarketStats.getMarketValue()).toFixed(2);
    // format market value
    const formattedMarketValue = marketValue;
    const last5minsMarketValue = await MarketStats.getLast5minsMarketValue();
    const formattedLast5minsMarketValue = formatCurrency(last5minsMarketValue).toFixed(2);
    const last10minsMarketValue = await MarketStats.getLast10minsMarketValue();
    const formattedLast10minsMarketValue = formatCurrency(last10minsMarketValue).toFixed(2);
    const last30minsMarketValue = await MarketStats.getLast30minsMarketValue();
    const formattedLast30minsMarketValue = formatCurrency(last30minsMarketValue).toFixed(2);


    // get market events
    const event = await GeneralEvent.getCurrentEvent();
    // format timestamps
    event.start_time = moment(event.start_time).format('LLLL');
    event.end_time = moment(event.end_time).format('LLLL');
    event.time_left = moment.duration(moment(event.end_time).diff(moment())).asMinutes();

    // work out percentage rise for 5 mins
    const percentage5mins = parseFloat(((marketValue - last5minsMarketValue) / last5minsMarketValue) * 100).toFixed(2);
    const percentage10mins = parseFloat(((marketValue - last10minsMarketValue) / last10minsMarketValue) * 100).toFixed(2);
    const percentage30mins = parseFloat(((marketValue - last30minsMarketValue) / last30minsMarketValue) * 100).toFixed(2);


    const formattedPercentage5mins = percentage5mins + '%';
    const formattedPercentage10mins = percentage10mins + '%';
    const formattedPercentage30mins = percentage30mins + '%';

    const top3Coins = await Coin.getTop3Coins();
    const top3CoinsArray = top3Coins.map(coin => {
        return {
            name: coin.name,
            price: formatCurrency(coin.current_price)
        };
    });

    // get all time market high from price history table
    const allTimeHigh = Number(await MarketStats.getAllTimeHighMarketValue()).toFixed(2);
    // const allTimeLow = await MarketStats.getAllTimeLow();

    const stats = {
        event: event,
        marketValue: formattedMarketValue,
        last5minsMarketValue: formattedLast5minsMarketValue,
        percentage5mins: formattedPercentage5mins,
        last10minsMarketValue: formattedLast10minsMarketValue,
        percentage10mins: formattedPercentage10mins,
        last30minsMarketValue: formattedLast30minsMarketValue,
        percentage30mins: formattedPercentage30mins,
        top3Coins: top3CoinsArray,
        allTimeHigh: formatCurrency(allTimeHigh)
    };

    const marketTotal = await Coin.getMarketTotal();
    console.log("Market Total:", marketTotal);
    stats.marketTotal = marketTotal;

    return res.status(200).json(stats);
}

function formatCurrency(value) {
    return Math.round(value * 100) / 100;
}

exports.formatCurrency = formatCurrency;
