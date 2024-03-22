const express = require('express');
const session = require('express-session');
const app = express();
const cors = require('cors');
const routes = require('./routes');
const priceAdjust = require('./price_logic/index');

app.use(express.json()); // for parsing application/json

// Setup CORS
app.use(cors({
    origin: 'http://127.0.0.1:5173', // Your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP Methods
    credentials: true // Allow credentials (cookies) to be sent
}));

app.use(session({
    secret: 'qwerty123',
    resave: false,
    saveUninitialized: false,
    // Additional options like cookie settings can be added here
}));

app.use('/api', routes); // Mount your API routes here

app.listen(9001, () => {
    console.log('Server is running on port 9001');
});

// create a function that logs timmer test to the console every 10 seconds


setInterval(priceAdjust, 30000);

module.exports = app; // Export for testing