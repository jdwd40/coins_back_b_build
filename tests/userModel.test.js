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
        });

    });

    describe('login method', () => {
        test('should login a user with correct credentials', async () => {
            const passwordHash = await bcrypt.hash('password123', 10);
            const newUser = new User('testuser9', 'testuser9@example.com', passwordHash);
            await User.register(newUser);

            const loggedInUser = await User.login('testuser9@example.com', 'password123');
            console.log(loggedInUser);
            expect(loggedInUser.username).toBe('testuser9');
            expect(loggedInUser.email).toBe('testuser9@example.com');
            console.log(loggedInUser);
        });

        test('should not login a user with incorrect password', async () => {
            const passwordHash = await bcrypt.hash('password123', 10);
            const newUser = new User('testuser9', 'testuser9@example.com', passwordHash);
            await User.register(newUser);

            await expect(User.login('testuser9@example.com', 'wrongpassword')).rejects.toThrow();
        });

        test('should not login a user with incorrect email', async () => {
            const passwordHash = await bcrypt.hash('password123', 10);
            const newUser = new User('testuser9', 'testuser9@example.com', passwordHash);
            await User.register(newUser);

            await expect(User.login('wrongemail@example.com', 'password123')).rejects.toThrow();
        });
    });

    describe('getters and setters for user.funds', () => {
        test('should set and get user funds correctly', () => {
            const user = new User('testuser', 'testuser@example.com', 'password123');
            user.funds = 1000; // set funds to 1000

            expect(user.funds).toBe(1000); // check if funds are set correctly
        });
    });
});



 


 

