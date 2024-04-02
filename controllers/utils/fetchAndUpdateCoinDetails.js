const Coin = require('../../models/Coin');

exports.fetchAndUpdateCoinDetails = async (coinEntry) => {
    const coinId = coinEntry.coin_id;
    const coinData = await Coin.getById(coinId);
    const price = coinData.current_price;
    const name = coinData.name;

    return {
        ...coinEntry, // Spread existing coin entry properties
        name,         // Add name to the entry
        current_price: price, // Add current price to the entry
    };
}

