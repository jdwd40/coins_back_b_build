process.env.NODE_ENV = 'test';
const db = require('../db/connection');
const Coin = require('../models/Coin');
const { seed } = require('../db/seed');
const testData = require('../db/data/test-data');

beforeAll(async () => {
    await seed(testData);
});

afterAll(async () => {
    await db.end();
});

describe('Coin Model', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('updatePriceById', () => {
        it('should update the price of a coin and adjust all-time high and low', async () => {
            const coinId = 1;
            const newPrice = "39.00";

            const coinBeforeUpdate = await Coin.getById(coinId);
            expect(coinBeforeUpdate.current_price).not.toBe(newPrice);

            const updatedCoin = await Coin.updatePriceById(coinId, newPrice);
            console.log('updated coin:', updatedCoin);

            expect(updatedCoin.current_price).toBe(newPrice);

            if (newPrice > coinBeforeUpdate.all_time_high) {
                expect(updatedCoin.all_time_high).toBe(newPrice);
                console.log('passed new price is all time high');
            }
            if (newPrice < coinBeforeUpdate.all_time_low) {
                expect(updatedCoin.all_time_low).toBe(newPrice);
                console.log('passed new price is all time low');
            }
        });
    });
});

