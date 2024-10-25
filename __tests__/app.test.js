process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require('../db/connection');
const seed = require('../db/seed');
const data = require('../db/data/test-data');
const { describe } = require('node:test');

describe('app', () => {
    beforeEach(() => {
        return seed(data);
    });
    
    afterAll(() => {
        return db.end();
    });

    // write tests that will test my coins routes
    describe('GET /coins', () => {
        it('should return a list of all coins', async () => {
            const response = await request(app).get('/api/coins');
            expect(response.status).toBe(200);
            expect(response.body.coins).toHaveLength(3);
            expect(response.body.coins[0]).toHaveProperty('name', 'Bitcoin');
        });
    });
});