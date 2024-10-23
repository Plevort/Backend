// /v1/auth/register.js
const bcrypt = require('bcryptjs');
const User = require('../../schemas/user');
const generateUniqueId = require('../../middleware/createid');
const createToken = require('../../middleware/maketoken');
require('dotenv').config()
const express = require('express');
const router = express.Router(); 

router.post('/register', async (req, res) => {
    const { email, username, password, passwordConfirm } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    if (!isValidPassword(password)) {
        return res.status(400).json({
            success: false,
            error: 'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
        });
    }

    if (password !== passwordConfirm) {
        return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }

    try {
        const existingUser = await User.findOne({
            $or: [
                { email },
                { username: { $regex: new RegExp(`^${username}$`, 'i') } }
            ]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ success: false, error: 'Email is already taken' });
            }
            if (existingUser.username.toLowerCase() === username.toLowerCase()) {
                return res.status(400).json({ success: false, error: 'Username is already taken' });
            }
        }

        const uniqueId = await generateUniqueId();

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password + process.env.BCRYPT_SECRET_PASSWORD, saltRounds);

        const newUser = new User({
            uniqueId,
            email,
            username,
            password: hashedPassword,
            displayName: username,
        });

        await newUser.save();

        const token = createToken(newUser.uniqueId, newUser.email);

        newUser.token = token;
        await newUser.save();

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                uniqueId: newUser.uniqueId,
                email: newUser.email,
                username: newUser.username,
                displayName: newUser.displayName,
            },
        });

    } catch (error) {
        console.error('Error while registering user:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, error: error.message });
        }

        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

function isValidPassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChars;
}

module.exports = router;
