const moment = require('moment');
const MarketStats = require('../models/MarketStats');
const GeneralEvent = require('../models/GeneralEvent');
const Coin = require('../models/Coin');

exports.getStats = async (req, res) => {
    // calculate market value
    const marketValue = await MarketStats.getMarketValue();
    // format market value
    const formattedMarketValue = marketValue.toLocaleString('en-GB', { style: 'currency', currency: 'GPD' });
    const last5minsMarketValue = await MarketStats.getLast5minsMarketValue();
    const formattedLast5minsMarketValue = last5minsMarketValue.toLocaleString('en-GB', { style: 'currency', currency: 'GPD' });
    const last10minsMarketValue = await MarketStats.getLast10minsMarketValue();
    const formattedLast10minsMarketValue = last10minsMarketValue.toLocaleString('en-GB', { style: 'currency', currency: 'GPD' });
    const last30minsMarketValue = await MarketStats.getLast30minsMarketValue();
    const formattedLast30minsMarketValue = last30minsMarketValue.toLocaleString('en-GB', { style: 'currency', currency: 'GPD' });
    // get market events
    const event = await GeneralEvent.getCurrentEvent();
    // format timestamps
    event.start_time = moment(event.start_time).format('LLLL');
    event.end_time = moment(event.end_time).format('LLLL');
    event.time_left = moment.duration(moment(event.end_time).diff(moment())).asMinutes();

    // work out percentage rise for 5 mins
    const percentage5mins = ((marketValue - last5minsMarketValue) / last5minsMarketValue) * 100;
    const percentage10mins = ((marketValue - last10minsMarketValue) / last10minsMarketValue) * 100;
    const percentage30mins = ((marketValue - last30minsMarketValue) / last30minsMarketValue) * 100;

    const formattedPercentage5mins = percentage5mins.toFixed(2) + '%';
    const formattedPercentage10mins = percentage10mins.toFixed(2) + '%';
    const formattedPercentage30mins = percentage30mins.toFixed(2) + '%';

    const top3Coins = await Coin.getTop3Coins();
    const top3CoinsArray = top3Coins.map(coin => {
        return {
            name: coin.name,
            price: coin.current_price
        };
    });

    const stats = {
        event: event,
        marketValue: formattedMarketValue,
        last5minsMarketValue: formattedLast5minsMarketValue,
        percentage5mins: formattedPercentage5mins,
        last10minsMarketValue: formattedLast10minsMarketValue,
        percentage10mins: formattedPercentage10mins,
        last30minsMarketValue: formattedLast30minsMarketValue,
        percentage30mins: formattedPercentage30mins,
        top3Coins: top3CoinsArray
    };

    return res.status(200).json(stats);
}
