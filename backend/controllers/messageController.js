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

const getAllRecipients = asyncHandler(async (req, res) => {
    try {
        // Get all the messages where the current user is the sender or recipient
        const messages = await Message.find({ 
            $or: [
                { sender: req.user._id },
                { recipient: req.user._id },
            ]
        }).populate("recipient").populate("sender");

        const recipients = new Map();
        const senders = new Map();

        // Extract all the recipients where I am the sender
        for (let i = 0; i < messages.length; i++) {
            if (messages[i].sender._id.toString() === req.user._id.toString()) {
                const recipient = messages[i].recipient;
                if (!recipients.has(recipient._id.toString())) {
                    recipients.set(recipient._id.toString(), {
                        id: recipient._id,
                        name: recipient.name,
                        email: recipient.email,
                        image: recipient.image
                    });
                }
            }
        }

        // Extract all the senders where I am the recipient
        for (let i = 0; i < messages.length; i++) {
            if (messages[i].recipient._id.toString() === req.user._id.toString()) {
                const sender = messages[i].sender;
                if (!senders.has(sender._id.toString())) {
                    senders.set(sender._id.toString(), {
                        id: sender._id,
                        name: sender.name,
                        email: sender.email,
                        image: sender.image
                    });
                }
            }
        }

        // Combine the recipients and senders into one array and remove duplicates
        const usersMap = new Map([...recipients, ...senders]);
        const users = Array.from(usersMap.values());

        res.status(200).json({ users: users, success: true });
    } catch (error) {
        res.status(400).json({ message: error.message, success: false });
    }
});


module.exports = { sendMessage, getMessagesWith, getAllRecipients };