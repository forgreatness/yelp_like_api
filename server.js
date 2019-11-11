const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const api = require('./api');

const app = express();
const port = process.env.PORT || 8000;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res, next) => {
    res.status(200).json('Welcome to my yelp-like server');
});

app.use('/', api);

app.use('*', (req, res, next) => {
    res.status(404).json({
        error: "Requested resource " + req.originalUrl + " does not exist"
    });
});

app.listen(port, () => {
    console.log("== Server is running on port", port);
});
