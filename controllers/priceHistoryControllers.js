// create priceHistory controller

const PriceHistory = require('../models/PriceHistory');

exports.getPriceHistory = async (req, res) => {
    try {
        const id = req.params.id;
        const priceHistory = await PriceHistory.getByCoinId(id);
        console.log('priceHistory:', priceHistory);
        res.status(200).json(priceHistory);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching price history', error: error.message });
    }
}

// exports.getPrevPriceHistory = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const priceHistory = await PriceHistory.getPrevByCoinId(id);
//         res.status(200).json(priceHistory);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching price history', error: error.message });
//     }
// }