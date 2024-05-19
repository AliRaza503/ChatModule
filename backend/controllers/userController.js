const asyncHandler = require('express-async-handler');
const User = require('../models/user');
const generateToken = require('../config/generateToken');
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, image } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }

    const userExists = await User.findOne({ email: email });

    if (userExists) {
        res.status(400).json({ message: 'User already registered', success: false, },);
        return;
    }

    const user = await User.create({
        name,
        email,
        password,
        image,
    });

    if (user) {
        res.status(201).json(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                token: generateToken(user._id),
                success: true,
            }
        );
    } else {
        res.status(400).json({ message: 'Invalid user data', success: false, });
    }
})

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (user && (await user.matchPassword(password))) {
        res.json(
            {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                token: generateToken(user._id),
                success: true,
            }
        );
    } else {
        res.status(400).json({ message: 'Invalid email or password', success: false, });
    }
});

// api/user?search = {userName}
const findUsers = asyncHandler(async (req, res) => {
    const keywords = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } },
        ],
    } : {};
    const users = await User.find({ ...keywords }).find({ _id: { $ne: req.user._id } }).select('name email image');
    if (users) {
        res.status(200).json({ users, success: true });
    } else {
        res.status(500).json({ message: 'Bad request', success: false });
    }
});

// api/user
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('name email image');
    // console.log(users);
    // Return all users except the logged in user
    const userId = req.user._id;
    const filteredUsers = users.filter(user => user._id.toString() !== userId.toString());
    if (users) {
        res.status(200).json({ users: filteredUsers, success: true });
    } else {
        res.status(500).json({ message: 'Bad request', success: false });
    }
});

module.exports = { registerUser, authUser, findUsers, getAllUsers };