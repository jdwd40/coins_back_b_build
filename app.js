const express = require('express');
const app = express();
const routes = require('./routes');

app.use(express.json()); // for parsing application/json

app.use('/api', routes); // Mount your API routes here

app.listen(9001, () => {
    console.log('Server is running on port 9001');
});
