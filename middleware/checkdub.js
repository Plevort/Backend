// /middleware/checkDub.js
const User = require('../schemas/user');

async function checkDuplicateId(req, res, next) {
    const { uniqueId } = req.body;
    try {
        const existingUser = await User.findOne({ uniqueId });

        if (existingUser) {
            return res.code(400).send({ error: 'Unique ID already exists. Please try again.' });
        }
        next();
    } catch (error) {
        console.error('Error while checking duplicate ID:', error);
        return res.code(500).send({ error: 'Internal Server Error' });
    }
}

module.exports = checkDuplicateId;
