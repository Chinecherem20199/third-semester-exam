const session = require('express-session');

const config  = require('./chatConfig');
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();
const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: 'session'
});

store.on('error', function (error) {
    console.log(error);
});

const maxAge = parseInt(config.sessionMaxAge);

const sessionMiddleware = session({
    store: store,
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 //1 DAY
    }
});

module.exports = sessionMiddleware;



