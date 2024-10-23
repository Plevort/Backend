// /middleware/verify.js
const jwt = require('jsonwebtoken');
const User = require('../schemas/user.js');

async function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Access denied, token missing!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ uniqueId: decoded.uniqueId });

        if (!user || user.token !== token) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = verifyToken;
