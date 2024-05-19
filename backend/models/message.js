const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['text', 'image'],
        default: 'text'
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    imageUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);