const asyncHandler = require('express-async-handler');
const Chat = require('../models/chat');
const User = require('../models/user');

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        res.status(400).json({ message: 'User ID is required', success: false });
        return;
    }
    // If the chat exists with this user, return the chat
    var isChat = await Chat.find({
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users", "-password")
        .populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name email pic"
    })

    if (isChat.length > 0) {
        res.status(200).json({ chat: isChat[0], success: true });
        return;
    }
    else {
        // Create a new chat
        const chat = new Chat({
            chatName: "sender",
            users: [req.user._id, userId],
            latestMessage: null,
        });
        try {
            const createdChat = await Chat.create(chat);

            const newChat = await Chat.findById(createdChat._id).populate("users", "-password");

            res.status(200).json({ chat: newChat, success: true });
        } catch (error) {
            res.status(400).json({ message: error, success: false });
        }
    }

});

// Fetch all the chats of the user and discard the chats with no messages
const fetchChats = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({ users: { $elemMatch: { $eq: userId } } })
            .populate("users", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        const populatedChats = await User.populate(chats, {
            path: "latestMessage.sender",
            select: "name email pic"
        });

        res.status(200).json({ chats: populatedChats, success: true });
    } catch (error) {
        res.status(400).json({ message: error, success: false });
    }
});

module.exports = { accessChat, fetchChats };