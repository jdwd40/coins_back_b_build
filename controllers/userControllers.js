const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10; // or any other number you prefer

exports.register = async (req, res) => {
    try {
        // Extract data from request body
        const { username, email, password } = req.body;

        // Validate data (consider using a library like joi for more comprehensive validation)
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create a new user instance and register
        const newUser = new User(username, email, passwordHash);
        const registeredUser = await User.register(newUser);

        // Return success response (exclude sensitive data like password)
        res.status(201).json({
            user_id: registeredUser.user_id,
            username: registeredUser.username,
            email: registeredUser.email
            // Add any additional fields you want to return
        });

    } catch (error) {
        // Handle specific errors (like duplicate email) separately if needed
        // if code 23505 .. email already exists then return 400 with email already exists message
        // if code 23505 .. username already exists then return 400 with username already exists message

        if (error.code === '23505' && error.constraint === 'users_email_key') {
            return res.status(400).json({ message: 'Email already exists' });
        }

        if (error.code === '23505' && error.constraint === 'users_username_key') {
            return res.status(400).json({ message: 'Username already exists' });
        }
    }
};

exports.login = async (req, res) => {
    try {
        // Extract data from request body
        const { username, password } = req.body;

        // Validate data
        if (!username || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if user exists
        const user = await User.login(username, password);

        // Return success response (exclude sensitive data like password)
        console.log("from controller", user);
        res.status(200).json({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            _last_login: user.last_login,
            // Add any additional fields you want to return
        });
        user.updateLoginTimestamp(user_id);

    } catch (error) {
        // Handle specific errors (like user not found or incorrect password) separately if needed
        // if user not found then return 404 with user not found message
        // if incorrect password then return 401 with incorrect password message
        console.log(error);

        if (error.message === 'User not found') {
            return res.status(401).json({ message: 'User not found' });
        }

        if (error.message === 'Invalid password') {
            return res.status(401).json({ message: 'Incorrect password' });
        }
    }
};

exports.logout = async (req, res) => {
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
};

exports.allusers = async (req, res) => {
    try {
        // Fetch all users
        const users = await User.allusers();

        // Return success response
        res.status(200).json(users);

    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFunds = async (req, res) => {
    try {
        // Fetch funds for the user
        const funds = await User.getFunds(req.params.user_id);

        // Return success response
        res.status(200).json({ funds });

    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Server error' });
    }
};

exports.setFunds = async (req, res) => {
    try {
        // Update funds for the user
        const newFunds = await User.setFunds(req.params.user_id, req.body.funds);

        // Return success response
        res.status(200).json({ funds: newFunds });

    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Server error' });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        // Delete the user
        await User.deleteUser(req.params.user_id);

        // Return success response
        res.status(200).json({ message: 'User deleted successfully' });

    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        // Fetch user by ID
        const user = await User.getUserById(req.params.user_id);

        // Return success response
        res.status(200).json(user);

    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Server error' });
    }
};