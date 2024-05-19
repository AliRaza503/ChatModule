const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getMessagesWith } = require('../controllers/messageController');

const router = express.Router();
router.route('/').post(protect, sendMessage);
// router.route('/:chatId').get(protect, allMessagesInChat);
router.route('/:recipientId').get(protect, getMessagesWith);

module.exports = router;