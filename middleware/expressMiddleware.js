const session = require('express-session');

const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config();
const store = new MongoDBStore({
    uri: process.env.MONGO_URL,
    collection: 'session'
});

store.on('error', function (error) {
    console.log(error);
});


const sessionMiddleware = session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 //1 DAY
    }
});

module.exports = sessionMiddleware;

