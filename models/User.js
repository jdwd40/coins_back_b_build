const db = require('../db/connection');
const bcrypt = require('bcrypt');

class User {
    constructor(username, email, passwordHash, funds, dateCreated, lastLogin, profileSettings, isActive) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this._funds = funds || 10000.00; // Default funds
        this.dateCreated = dateCreated || new Date();
        this._lastLogin = lastLogin || new Date();
        this.profileSettings = profileSettings || {};
        this._isActive = isActive !== undefined ? isActive : true;
    }

    // Getter and Setter for funds
    get funds() {
        return this._funds;
    }

    set funds(value) {
        this._funds = value;
    }

    // Getter and Setter for lastLogin
    get lastLogin() {
        return this._lastLogin;
    }

    set lastLogin(value) {
        this._lastLogin = value;
    }

    // Getter and Setter for isActive
    get isActive() {
        return this._isActive;
    }

    set isActive(value) {
        this._isActive = value;
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

    static async login(email, password) {
        try {
            // Fetch the user by email
            console.log("email", email);
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (!user) {
                throw new Error('email not found');
            }

            // Compare the provided password with the stored hash
            const isValid = await bcrypt.compare(password, user.password_hash);

            if (!isValid) {
                throw new Error('Invalid password');
            }

            // Return user if authentication is successful
            // console.log("from model", user);
            return {
                userId: user.user_id,
                username: user.username,
                email: user.email,
                funds: user.funds,
                dateCreated: user.date_created,
                lastLogin: user.last_login,
                profileSettings: user.profile_settings,
                isActive: user.is_active
            };
        } catch (error) {
            throw error;
        }

    }

    static async getFunds(user_id) {
        try {
            const result = await db.query('SELECT funds FROM users WHERE user_id = $1', [user_id]);
            return result.rows[0].funds;
        } catch (error) {
            throw error;
        }
    }

    // write setFunds method here
    static async setFunds(user_id, newFunds) {
        try {
            const result = await db.query('UPDATE users SET funds = $1 WHERE user_id = $2 RETURNING funds', [newFunds, user_id]);
            return result.rows[0].funds;
        } catch (error) {
            throw error;
        }
    }

    static async updateLoginTimestamp(user_id) {
        try {
            const result = await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [user_id]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async logout() {
        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Server error' });
            }
            res.status(200).json({ message: 'Logged out successfully' });
        });
    }

    static async deleteUser(user_id) {
        try {
            const result = await db.query('DELETE FROM users WHERE user_id = $1', [user_id]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    static async allusers() {
        try {
            const result = await db.query('SELECT * FROM users');
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async getUserById(user_id) {
        try {
            const result = await db.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async updateFundsAfterBuy(user_id, amount) {
        try {
            const result = await db.query('UPDATE users SET funds = funds - $1 WHERE user_id = $2 RETURNING funds', [amount, user_id]);
            return result.rows[0].funds;
        } catch (error) {
            throw error;
        }
    }

    static async updateFundsAfterSell(user_id, amount) {
        try {
            const result = await db.query('UPDATE users SET funds = funds + $1 WHERE user_id = $2 RETURNING funds', [amount, user_id]);
            return result.rows[0].funds;
        } catch (error) {
            throw error;
        }
    }

    static async checkFunds(user_id, amount) {
        // return true if user has enough funds, false otherwise
        try {
            const result = await db.query('SELECT funds FROM users WHERE user_id = $1', [user_id]);
            return result.rows[0].funds >= amount;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
