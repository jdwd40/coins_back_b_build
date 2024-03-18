const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userControllers'); // Adjust path as needed
const User = require('../models/User'); // Adjust path as needed

userRouter.post('/register', (req, res) => {
    console.log("Register route hit");
    userController.register(req, res);
});

userRouter.post('/login', async (req, res) => {
    console.log("Login route hit");
    try {
        const user = await User.login(req.body.username, req.body.password);
        // console.log("from route", user);
        if (user) {
            // Create session here
            req.session.userId = user.id; // Storing user ID in session
            res.status(200).json(user);
        }
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
});

userRouter.post('/logout', (req, res) => {
    console.log("LogOUT! route hit");
    userController.logout(req, res);
});

userRouter.get('/getFunds/:user_id', (req, res) => {
    console.log("Get Funds route hit");
    userController.getFunds(req, res);
});

userRouter.put('/setFunds/:user_id', (req, res) => {
    console.log("Set Funds route hit");
    userController.setFunds(req, res);
});

userRouter.delete('/:user_id', (req, res) => {
    console.log("Delete User route hit");
    userController.deleteUser(req, res);
});

userRouter.get('/', (req, res) => {
    console.log("Logout route hit");
    userController.allusers(req, res);
});

module.exports = userRouter;
