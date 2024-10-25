process.env.NODE_ENV = 'test';
const db = require('../db/connection');
const Coin = require('../models/Coin');

jest.mock('../db/connection');

describe('Coin Model', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should fetch all coins from the database', async () => {
            const mockCoins = [{ id: 1, name: 'Bitcoin' }, { id: 2, name: 'Ethereum' }];
            db.query.mockResolvedValue({ rows: mockCoins });

            const coins = await Coin.getAll();

            expect(db.query).toHaveBeenCalledWith('SELECT * FROM coins');
            expect(coins).toEqual(mockCoins);
        });
    });

    describe('getById', () => {
        it('should fetch a single coin by its ID', async () => {
            const mockCoin = { id: 1, name: 'Bitcoin' };
            db.query.mockResolvedValue({ rows: [mockCoin] });

            const coin = await Coin.getById(1);

            expect(db.query).toHaveBeenCalledWith('SELECT * FROM coins WHERE coin_id = $1', [1]);
            console.log(coin);
            expect(coin).toEqual(mockCoin);
        });
    });

    describe('getPriceById', () => {
        it('should fetch the current price of a coin by its ID', async () => {
            const mockPrice = { current_price: '50000' };
            db.query.mockResolvedValue({ rows: [mockPrice] });

            const price = await Coin.getPriceById(1);

            expect(db.query).toHaveBeenCalledWith('SELECT current_price FROM coins WHERE coin_id = $1', [1]);
            expect(price).toBe(50000);
        });

        it('should throw an error if the coin is not found', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await expect(Coin.getPriceById(1)).rejects.toThrow('Coin with ID 1 not found');
        });
    });

    describe('create', () => {
        it('should add a new coin to the database', async () => {
            const newCoinData = { name: 'Bitcoin', symbol: 'BTC' };
            const mockCoin = { id: 1, ...newCoinData };
            db.query.mockResolvedValue({ rows: [mockCoin] });

            const coin = await Coin.create(newCoinData);

            expect(db.query).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
            expect(coin).toEqual(mockCoin);
        });
    });

    describe('updateById', () => {
        it('should update a coin\'s data in the database', async () => {
            const updatedCoinData = { coin_id: 1, name: 'Bitcoin', symbol: 'BTC' };
            db.query.mockResolvedValue({ rows: [updatedCoinData] });

            await Coin.updateById(1, updatedCoinData);

            expect(db.query).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
        });
    });

    describe('updatePriceById', () => {
        it('should update a coin\'s price in the database', async () => {
            const mockCoin = { id: 1, current_price: '60000' };
            db.query.mockResolvedValue({ rows: [mockCoin] });

            const updatedCoin = await Coin.updatePriceById(1, 60000);

            expect(db.query).toHaveBeenCalledWith('UPDATE coins SET current_price = $1 WHERE coin_id = $2 RETURNING *;', [60000, 1]);
            expect(updatedCoin).toEqual(mockCoin);
        });
    });

    describe('deleteById', () => {
        it('should delete a coin from the database', async () => {
            const mockCoin = { id: 1, name: 'Bitcoin' };
            db.query.mockResolvedValue({ rows: [mockCoin] });

            const deletedCoin = await Coin.deleteById(1);

            expect(db.query).toHaveBeenCalledWith('DELETE FROM coins WHERE coin_id = $1', [1]);
            expect(deletedCoin).toEqual(mockCoin);
        });
    });

    describe('getCoinEvent', () => {
        it('should fetch the event associated with a specific coin', async () => {
            const mockEvent = [{ coin_id: 1, type: 'Fork' }];
            db.query.mockResolvedValue({ rows: mockEvent });

            const event = await Coin.getCoinEvent(1);

            expect(db.query).toHaveBeenCalledWith('SELECT * FROM coin_events WHERE coin_id = $1', [1]);
            expect(event).toEqual(mockEvent);
        });
    });

    describe('addCoinEvent', () => {
        it('should create a new event for a specific coin', async () => {
            const newEvent = { coin_id: 1, event_type: 'Fork', impact: 'High', is_positive: true, start_time: new Date(), end_time: new Date() };
            const mockEvent = { id: 1, ...newEvent };
            db.query.mockResolvedValue({ rows: [mockEvent] });

            const event = await Coin.addCoinEvent(newEvent);

            expect(db.query).toHaveBeenCalledWith(expect.any(String), expect.any(Array));
            expect(event).toEqual(mockEvent);
        });
    });

    describe('getMarketTotal', () => {
        it('should calculate the total market cap of all coins', async () => {
            const mockTotal = { sum: '1000000' };
            db.query.mockResolvedValue({ rows: [mockTotal] });

            const total = await Coin.getMarketTotal();

            expect(db.query).toHaveBeenCalledWith('SELECT SUM(current_price) FROM coins');
            expect(total).toBe(1000000);
        });

        it('should throw an error if unable to calculate market total', async () => {
            db.query.mockResolvedValue({ rows: [] });

            await expect(Coin.getMarketTotal()).rejects.toThrow('Unable to calculate market total');
        });
    });

    describe('getTop3Coins', () => {
        it('should fetch the top 3 coins by market cap', async () => {
            const mockCoins = [{ id: 1, name: 'Bitcoin' }, { id: 2, name: 'Ethereum' }, { id: 3, name: 'Ripple' }];
            db.query.mockResolvedValue({ rows: mockCoins });

            const coins = await Coin.getTop3Coins();

            expect(db.query).toHaveBeenCalledWith('SELECT * FROM coins ORDER BY current_price DESC LIMIT 5');
            expect(coins).toEqual(mockCoins);
        });
    });
});