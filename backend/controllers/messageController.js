const asyncHandler = require('express-async-handler');
const Message = require('../models/message');

const sendMessage = asyncHandler(async (req, res) => {
    const {content, recipientId} = req.body;
    if (!content || !recipientId) {
        res.status(400).json({ message: 'Invalid data passed into request', success: false });
        return;
    }

    try {
        var message = await Message.create({
            sender: req.user._id,
            content: content,
            recipient: recipientId
        });
        message = ((await (await message.populate("sender")).populate("recipient")).toObject());
        // console.log(message);
        res.status(200).json({ message: message, success: true });
    } catch (error) {
        res.status(400).json({ message: error, success: false });
    }
});

const getMessagesWith = asyncHandler(async (req, res) => {
    const recipientId = req.params.recipientId;
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, recipient: recipientId },
                { sender: recipientId, recipient: req.user._id }
            ]
        }).populate("sender").populate("recipient");
        // Add sentByMe property to each message object
        for (let i = 0; i < messages.length; i++) {
            messages[i] = messages[i].toObject();
            messages[i].sentByMe = messages[i].sender._id.toString() === req.user._id.toString();
        }
        // console.log(recipientId, req.user._id, messages)
        res.status(200).json({ messages: messages, success: true });
    } catch (error) {
        res.status(400).json({ message: error, success: false });
    }
});

module.exports = { sendMessage, getMessagesWith };