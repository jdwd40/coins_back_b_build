const db = require('../db/connection'); // Path to your database connection

class User {
    constructor(username, email, passwordHash, funds, dateCreated, lastLogin, profileSettings, isActive) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.funds = funds || 10000.00; // Default funds
        this.dateCreated = dateCreated || new Date();
        this.lastLogin = lastLogin || new Date();
        this.profileSettings = profileSettings || {};
        this.isActive = isActive !== undefined ? isActive : true;
    }

    // Method to save a new user to the database
    static async register(newUser) {
        const { username, email, passwordHash } = newUser;
        // add the current date to the dateCreated and lastLogin properties
        newUser.dateCreated = new Date();
        newUser.lastLogin = new Date();
        newUser.isActive = true;
        newUser.passwordHash = passwordHash;

        try {
            const result = await db.query(`
            INSERT INTO users (username, email, password_hash, date_created, last_login, is_active)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id, username, email;`, 
            [username, email, passwordHash, newUser.dateCreated, newUser.lastLogin, newUser.isActive]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Additional methods like login, update, delete can be added here
}

module.exports = User;
