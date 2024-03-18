const request = require('supertest');
const app = require('../app'); // Adjust the path to your Express app
const testData = require('../db/data/test-data/index')
const { seed } = require('../db/seed');
const db = require('../db/connection');

// Setup and teardown functions if needed
beforeAll(async () => {
    // Setup test database, create tables, etc.
    await seed(testData);
});

afterAll(async () => {
    // Cleanup test database
    await db.end();
});

describe('User Controller', () => {
    describe('POST /api/users/register', () => {
        test('should register a new user successfully', async () => {
            const newUser = {
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/users/register')
                .send(newUser);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('user_id');
            expect(response.body.username).toBe(newUser.username);
            expect(response.body.email).toBe(newUser.email);

        });

        test('should fail with missing user data', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({ username: 'testuser2' }); // Incomplete data
            expect(response.statusCode).toBe(400);
        });

        // write tests should fail is duplicate email
        test('should not register a user with a duplicate email', async () => {
            const newUser = {
                username: 'testuser2',
                email: 'jane_doe@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/users/register')
                .send(newUser);
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('Email already exists');
        });

        // write tests should fail is duplicate username
        test('should not register a user with a duplicate username', async () => {
            const newUser = {
                username: 'jane_doe',
                email: 'testemail@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/users/register')
                .send(newUser);
            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('Username already exists');
        });
        // write tests to register a new user then login with that user to test login route
        test('should login a user with correct credentials', async () => {
            const newUser = {
                username: 'testuser10',
                email: 'testemail10@example.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/users/register')
                .send(newUser);

            const response = await request(app)
                .post('/api/users/login')
                .send({ email: newUser.email, password: newUser.password });
                console.log(response.body);
            expect(response.statusCode).toBe(200);
            expect(response.body.username).toBe(newUser.username);
            expect(response.body.email).toBe(newUser.email);
        }
        );

    });


});
