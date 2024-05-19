const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    chatName: { type: String, trime: true },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }
}, { timestamps: true });


module.exports = mongoose.model('Chat', chatSchema);