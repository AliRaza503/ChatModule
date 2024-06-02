const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getMessagesWith, getAllRecipients } = require('../controllers/messageController');

const router = express.Router();
router.route('/').post(protect, sendMessage);
router.route('/:recipientId').get(protect, getMessagesWith);
router.route('/').get(protect, getAllRecipients);

module.exports = router;