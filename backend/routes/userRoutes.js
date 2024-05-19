const express = require('express');
const { registerUser, authUser, getAllUsers } = require('../controllers/userController');
const {protect}  = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/register').post(registerUser)
router.post('/login', authUser)
// router.get('/', protect, findUsers);
// Call API using the URL: http://localhost:3000/user
router.get('/', protect, getAllUsers);


module.exports = router;