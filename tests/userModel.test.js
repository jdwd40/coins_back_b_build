const db = require('../db/connection');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const testData = require('../db/data/test-data/index')

const { seed } = require('../db/seed');
// Setup and teardown functions if needed
beforeAll(async () => {
    // Setup test database, create tables, etc.
    await seed(testData);
});

afterAll(async () => {
    // Cleanup test database
    await db.end();
});

describe('User model', () => {
    describe('register method', () => {
        test('should register a new user successfully', async () => {
            const passwordHash = await bcrypt.hash('password123', 10);
            const newUser = new User('testuser', 'testuser@example.com', passwordHash);
            
            const registeredUser = await User.register(newUser);

            expect(registeredUser).toHaveProperty('user_id');
            expect(registeredUser.username).toBe('testuser');
            expect(registeredUser.email).toBe('testuser@example.com');
            console.log(registeredUser);
        });

        test('should not register a user with a duplicate email or username', async () => {
            const passwordHash = await bcrypt.hash('password123', 10);
            const newUser = new User('testuser2', 'testuser@example.com', passwordHash); // Same email as above
            // test for duplicate email
            await expect(User.register(newUser)).rejects.toThrow();
            const newUser2 = new User('testuser', 'testuser6@example.com', passwordHash); // Same username as above
            // test for duplicate username
            await expect(User.register(newUser2)).rejects.toThrow();

            // Check for specific error if your model throws it
        });

        // More tests for different scenarios
    });

    // Additional test suites for other User model methods
});
