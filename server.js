
const path = require('path');
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const sessionMiddleware = require('./middleware/expressMiddleware');
const connectMongo = require('./db');
require('dotenv').config();
const {
    saveSessionID,
    loadMessage,
    welcomeMessage,
    mainMenu,
    menu,
    checkOutOrder,
    orderHistory,
    currentOrder,
    cancelOrder,
    saveOrder
} = require('./controller/botController');

const formatMessage = require('./utils/message');
const { config } = require('./middleware/chatConfig');
const MessageModel = require('./model/mesgSchema');
io.engine.use(sessionMiddleware);

//to save the flow and remember previous message
const levels = {};

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);

io.on('connection', async(socket) => {
    // get the session
    console.log('New Websocket');
    const session = socket.request.session;
    const sessionId = session.id;
    // console.log(sessionId);
    saveSessionID(sessionId);
    //connect users with the same session id
    socket.join(sessionId);
    //welcome users to chat bot
    welcomeMessage(io, sessionId);
    loadMessage(io, sessionId);

    //listen for user message
    levels[sessionId] = 0;
    socket.on('private message', async (msg) => {
        let userMessage = formatMessage('You', msg);
        const number = parseInt(msg);
        io.to(sessionId).emit('user message', userMessage);
        let botMessage = '';

        switch (levels[sessionId]) {
            case 0:
                botMessage = await mainMenu(io, sessionId);
                levels[sessionId] = 1;
                break;
            case 1:
                if (number === 1) {
                    botMessage = await menu(io, sessionId);
                    levels[sessionId] = 2;
                    return;
                } else if (number === 99) {
                    botMessage = await checkOutOrder(io, sessionId);
                    levels[sessionId] = 1;
                } else if (number === 98) {
                    botMessage = await orderHistory(io, sessionId);
                    levels[sessionId] = 1;
                } else if (number === 97) {
                    botMessage = await currentOrder(io, sessionId);
                } else if (number === 0) {
                    botMessage = await cancelOrder(io, sessionId);
                } else {
                    botMessage = await formatMessage(
                        config.botName,
                        'Invalid Input. Enter 1 or 99 or 98 or 97 or 0'
                    );
                    io.to(sessionId).emit('bot message', botMessage);
                }
                levels[sessionId] = 1;
                break;
            case 2:
                if (
                    number !== 1 &&
                    number !== 2 &&
                    number !== 3 &&
                    number !== 4 &&
                    number !== 5
                ) {
                    botMessage = await formatMessage(
                        config.botName,
                        'Invalid Input. Enter 1 or 2 or 3 or 4 or 5'
                    );
                    io.to(sessionId).emit('bot message', botMessage);
                    levels[sessionId] = 2;
                    return;
                } else {
                    botMessage = await saveOrder(io, sessionId, number);
                    levels[sessionId] = 1;
                }
                break;
        }
        const saveMessage = await new MessageModel({
            sessionID: sessionId,
            userMessage,
            botMessage
        });
        await saveMessage.save();
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
connectMongo(server);

module.exports = app;