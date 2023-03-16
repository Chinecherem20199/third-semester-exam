const session = require('express-session');

const config  = require('./chatConfig');

const maxAge = parseInt(config.sessionMaxAge);

const sessionMiddleware = session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge }
});

module.exports = sessionMiddleware;
