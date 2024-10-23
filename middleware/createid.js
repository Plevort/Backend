// /middleware/createid.js
const crypto = require('crypto');
const User = require('../schemas/user');

async function generateUniqueId() {
    let uniqueId;
    let isDuplicate;

    do {
        const randomBytes = crypto.randomBytes(8);
        uniqueId = BigInt('0x' + randomBytes.toString('hex'));

        isDuplicate = await User.findOne({ uniqueId });
    } while (isDuplicate); 

    return uniqueId;
}

module.exports = generateUniqueId;