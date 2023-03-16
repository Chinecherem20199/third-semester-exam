
const SessionDB = require('../model/sessionSchema');
const messageModel = require('../model/mesgSchema');
const formatMessage = require('../utils/message');
const { mainMenu, foodMenu } = require('../utils/mainMenu');
const formatArray = require('../utils/formatArray');
const { chatConfig } = require('../middleware/chatConfig');
require('dotenv').config()

exports.saveSessionID = async (sessionID) => {
    const checksessionID = await SessionDB.findOne({ sessionID });

    if (!checksessionID) {
        await SessionDB.create({ sessionID });
    }
};

exports.loadMessage = async (io, sessionID) => {
    const oldMessages = await messageModel.find({ sessionID });

    if (!oldMessages) return;

    oldMessages.forEach((message) => {
        io.to(message.sessionID).emit('user message', message.userMessage);
        io.to(message.sessionID).emit('bot message', message.botMessage);
    });
};

exports.welcomeMessage = (io, sessionID) => {
    io.to(sessionID).emit(
        'bot message',
        formatMessage(
            process.env.botName,
            "Welcome to Chi ChatBot! 🤖 <br> Say hello to the bot"
        )
    );
};

exports.mainMenu = (io, sessionID) => {
    let botMessage = formatMessage(
        process.env.botName,
        formatArray('mainMenu', mainMenu)
    );
    io.to(sessionID).emit('bot message', botMessage);
    return botMessage;
};

exports.menu = (io, sessionID) => {
    let botMessage = formatMessage(
        process.env.botName,
        formatArray('Select an Item To Add to Your Cart', foodMenu)
    );
    io.to(sessionID).emit('bot message', botMessage);
    return botMessage;
};

exports.checkOutOrder = async (io, sessionID) => {
    const sessionOrder = await SessionDB.findOne({ sessionID });

    let botMessage = '';
    if (sessionOrder.currentOrder.length < 1) {
        botMessage = formatMessage(
            process.env.botName,
            'You have not ordered anything yet, try to place an order'
        );
        io.to(sessionID).emit('bot message', botMessage);
    } else {
        sessionOrder.placedOrder = [
            ...sessionOrder.currentOrder,
            ...sessionOrder.placedOrder
        ];
        sessionOrder.currentOrder = [];
        await sessionOrder.save();

        botMessage = formatMessage(process.env.botName, 'Order Placed');

        io.to(sessionID).emit('bot message', botMessage);
    }
    io.to(sessionID).emit(
        'bot message',
        formatMessage(process.env.botName, mainMenu)
    );

    return botMessage;
};

exports.orderHistory = async (io, sessionID) => {
    const sessionOrder = await SessionDB.findOne({ sessionID });

    let botMessage = '';

    if (sessionOrder.placedOrder.length < 1) {
        botMessage = formatMessage(
            process.env.botName,
            'You have not ordered anything yet, try to place an order'
        );
        io.to(sessionID).emit('bot message', botMessage);
    } else {
        botMessage = formatMessage(
            process.env.botName,
            formatArray('Your Order History', sessionOrder.placedOrder)
        );
        io.to(sessionID).emit('bot message', botMessage);
    }
    io.to(sessionID).emit(
        'bot message',
        formatMessage(process.env.botName, mainMenu)
    );

    return botMessage;
};

exports.currentOrder = async (io, sessionID) => {
    const sessionOrder = await SessionDB.findOne({ sessionID });

    let botMessage = '';

    if (sessionOrder.currentOrder.length < 1) {
        botMessage = formatMessage(
            process.env.botName,
            'You have not ordered anything yet, try to place an order'
        );
        io.to(sessionID).emit('bot message', botMessage);
    } else {
        botMessage = formatMessage(
            process.env.botName,
            formatArray('Your Current Order', sessionOrder.currentOrder)
        );
        io.to(sessionID).emit('bot message', botMessage);
    }

    io.to(sessionID).emit(
        'bot message',
        formatMessage(process.env.botName, mainMenu)
    );

    return botMessage;
};

exports.cancelOrder = async (io, sessionID) => {
    const sessionOrder = await SessionDB.findOne({ sessionID });

    let botMessage = '';

    if (sessionOrder.currentOrder.length < 1) {
        botMessage = formatMessage(
            process.env.botName,
            'You have not ordered anything yet, try to place an order'
        );

        io.to(sessionID).emit('bot message', botMessage);
    } else {
        botMessage = formatMessage(process.env.botName, 'Order Cancelled');

        sessionOrder.currentOrder = [];
        await sessionOrder.save();

        io.to(sessionID).emit('bot message', botMessage);
    }
    //TODO: save the resposne to the database
    io.to(sessionID).emit(
        'bot message',
        formatMessage(process.env.botName, mainMenu)
    );

    return botMessage;
};

exports.saveOrder = async (io, sessionID, number) => {
    const sessionOrder = await SessionDB.findOne({ sessionID });

    let botMessage = '';

    if (number === 1) {
        sessionOrder.currentOrder.push(foodMenu[0]);
    }
    if (number === 2) {
        sessionOrder.currentOrder.push(foodMenu[1]);
    }
    if (number === 3) {
        sessionOrder.currentOrder.push(foodMenu[2]);
    }
    if (number === 4) {
        sessionOrder.currentOrder.push(foodMenu[3]);
    }
    if (number === 5) {
        sessionOrder.currentOrder.push(foodMenu[4]);
    }

    await sessionOrder.save();

    botMessage = formatMessage(
        process.env.botName,
        formatArray('Order Added', sessionOrder.currentOrder)
    );
    io.to(sessionID).emit('bot message', botMessage);

    io.to(sessionID).emit(
        'bot message',
        formatMessage(process.env.botName, mainMenu)
    );

    return botMessage;
};
