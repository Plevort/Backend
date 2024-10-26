// /v1/auth/login.js
const bcrypt = require('bcryptjs');
const User = require('../../schemas/user'); 
const createToken = require('../../middleware/maketoken');
const express = require('express');
require('dotenv').config()
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password + process.env.BCRYPT_SECRET_PASSWORD, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    let token = user.token;
    if (!token) {
      token = createToken(user.uniqueId, user.email);
      user.token = token;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token, 
    });

  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
