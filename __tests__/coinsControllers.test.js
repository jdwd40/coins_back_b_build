const request = require('supertest');
const express = require('express');
const moment = require('moment');
const coinsController = require('../controllers/coinsControllers');
const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const CoinEvent = require('../models/CoinEvent');

const app = express();
app.use(express.json());
app.get('/coins', coinsController.getAllCoins);
app.get('/coins/:id', coinsController.getCoinById);
app.get('/coins/:id/price-history', coinsController.getPriceHistory);
app.post('/coins', coinsController.createCoin);
app.put('/coins/:id', coinsController.updateCoin);
app.delete('/coins/:id', coinsController.deleteCoin);
app.put('/coins/:id/price', coinsController.updateCoinPrice);
app.get('/coins/:id/events', coinsController.getCoinEventsById);
app.get('/coins/:id/price', coinsController.getCoinPrice);
app.post('/coins/price', coinsController.setCoinPrice);

jest.mock('../models/Coin');
jest.mock('../models/PriceHistory');
jest.mock('../models/CoinEvent');

describe('Coins Controller', () => {
    describe('getAllCoins', () => {
        it('should return all coins', async () => {
            const mockCoins = [{ id: 1, name: 'Bitcoin' }, { id: 2, name: 'Ethereum' }];
            Coin.getAll.mockResolvedValue(mockCoins);

            const response = await request(app).get('/coins');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockCoins);
        });

        it('should handle errors', async () => {
            Coin.getAll.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/coins');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching coins', error: 'Database error' });
        });
    });

    describe('getCoinById', () => {
        it('should return a coin by id', async () => {
            const mockCoin = { id: 1, name: 'Bitcoin', current_price: 50000 };
            const mockPriceHistory = [{ price: 50000 }, { price: 49000 }];
            const mockCoinEvent = [{ end_time: Date.now() + 60000, type: 'event', is_positive: true, impact: 'high' }];
            Coin.getById.mockResolvedValue(mockCoin);
            PriceHistory.getByCoinId.mockResolvedValue(mockPriceHistory);
            PriceHistory.getAllTimeHigh.mockResolvedValue(60000);
            PriceHistory.getAllTimeLow.mockResolvedValue(30000);
            PriceHistory.getLast5minsValueByCoinId.mockResolvedValue(49500);
            PriceHistory.getLast10minsValueByCoinId.mockResolvedValue(49000);
            PriceHistory.getLast30minsValueByCoinId.mockResolvedValue(48000);
            CoinEvent.getCurrentEvent.mockResolvedValue(mockCoinEvent);

            const response = await request(app).get('/coins/1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.objectContaining({
                id: 1,
                name: 'Bitcoin',
                current_price: 50000,
                priceHistory: mockPriceHistory,
                allTimeHigh: 60000,
                allTimeLow: 30000,
                medianAverage: 49500,
                last5minsValue: '49500.00',
                percentage5mins: '1.01%',
                last10minsValue: '49000.00',
                percentage10mins: '2.04%',
                last30minsValue: '48000.00',
                percentage30mins: '4.17%',
                meanAverage: 49500,
                eventDuration: expect.any(String),
                eventType: 'event',
                coinEventPositive: true,
                eventImpact: 'high'
            }));
        });

        it('should handle coin not found', async () => {
            Coin.getById.mockResolvedValue(null);

            const response = await request(app).get('/coins/1');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Coin not found' });
        });

        it('should handle errors', async () => {
            Coin.getById.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/coins/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching coin', error: 'Database error' });
        });
    });

    describe('createCoin', () => {
        it('should create a new coin', async () => {
            const newCoin = { name: 'Bitcoin', current_price: 50000 };
            const createdCoin = { id: 1, ...newCoin };
            Coin.create.mockResolvedValue(createdCoin);

            const response = await request(app).post('/coins').send(newCoin);

            expect(response.status).toBe(201);
            expect(response.body).toEqual(createdCoin);
        });

        it('should handle errors', async () => {
            Coin.create.mockRejectedValue(new Error('Database error'));

            const response = await request(app).post('/coins').send({ name: 'Bitcoin', current_price: 50000 });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error creating coin', error: 'Database error' });
        });
    });

    describe('updateCoin', () => {
        it('should update a coin', async () => {
            const updatedCoin = { id: 1, name: 'Bitcoin', current_price: 51000 };
            Coin.updateById.mockResolvedValue(updatedCoin);

            const response = await request(app).put('/coins/1').send({ current_price: 51000 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedCoin);
        });

        it('should handle errors', async () => {
            Coin.updateById.mockRejectedValue(new Error('Database error'));

            const response = await request(app).put('/coins/1').send({ current_price: 51000 });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error updating coin', error: 'Database error' });
        });
    });

    describe('deleteCoin', () => {
        it('should delete a coin', async () => {
            Coin.deleteById.mockResolvedValue();

            const response = await request(app).delete('/coins/1');

            expect(response.status).toBe(204);
            expect(response.body).toEqual({ message: "Coin deleted successfully " });
        });

        it('should handle errors', async () => {
            Coin.deleteById.mockRejectedValue(new Error('Database error'));

            const response = await request(app).delete('/coins/1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error deleting coin', error: 'Database error' });
        });
    });

    describe('updateCoinPrice', () => {
        it('should update the price of a coin', async () => {
            const updatedCoin = { id: 1, name: 'Bitcoin', current_price: 51000 };
            Coin.updatePriceById.mockResolvedValue(updatedCoin);

            const response = await request(app).put('/coins/1/price').send({ newPrice: 51000 });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedCoin);
        });

        it('should handle errors', async () => {
            Coin.updatePriceById.mockRejectedValue(new Error('Database error'));

            const response = await request(app).put('/coins/1/price').send({ newPrice: 51000 });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error updating coin price', error: 'Database error' });
        });
    });

    describe('getCoinEventsById', () => {
        it('should return coin events by id', async () => {
            const mockCoinEvents = [{ start_time: Date.now(), end_time: Date.now() + 60000, type: 'event', is_positive: true, impact: 'high' }];
            CoinEvent.getById.mockResolvedValue(mockCoinEvents);

            const response = await request(app).get('/coins/1/events');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    start_time: expect.any(String),
                    end_time: expect.any(String),
                    duration: expect.any(String),
                    type: 'event',
                    is_positive: true,
                    impact: 'high'
                })
            ]));
        });

        it('should handle errors', async () => {
            CoinEvent.getById.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/coins/1/events');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching coin events', error: 'Database error' });
        });
    });

    describe('getCoinPrice', () => {
        it('should return the current price of a coin', async () => {
            const mockCoin = { id: 1, name: 'Bitcoin', current_price: 50000 };
            Coin.getById.mockResolvedValue(mockCoin);

            const response = await request(app).get('/coins/1/price');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ current_price: 50000 });
        });

        it('should handle coin not found', async () => {
            Coin.getById.mockResolvedValue(null);

            const response = await request(app).get('/coins/1/price');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: 'Coin not found' });
        });

        it('should handle errors', async () => {
            Coin.getById.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/coins/1/price');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error fetching price', error: 'Database error' });
        });
    });

    describe('setCoinPrice', () => {
        it('should set the price of a coin', async () => {
            const updatedCoin = { id: 1, name: 'Bitcoin', current_price: 51000 };
            Coin.updatePriceById.mockResolvedValue(updatedCoin);

            const response = await request(app).post('/coins/price').send({ coin_id: 1, current_price: '51000' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updatedCoin);
        });

        it('should handle errors', async () => {
            Coin.updatePriceById.mockRejectedValue(new Error('Database error'));

            const response = await request(app).post('/coins/price').send({ coin_id: 1, current_price: '51000' });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: 'Error setting price', error: 'Database error' });
        });
    });
});