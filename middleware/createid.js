// /middleware/createId.js
const crypto = require('crypto');
const User = require('../schemas/user'); // Adjust the path as necessary

async function generateUniqueId() {
    let uniqueId;
    let isDuplicate;

    do {
        // Generate 8 random bytes (64 bits)
        const randomBytes = crypto.randomBytes(8);
        // Convert the random bytes to a hex string and then to a BigInt
        uniqueId = BigInt('0x' + randomBytes.toString('hex'));

        // Check for duplicates in the database
        isDuplicate = await User.findOne({ uniqueId });
    } while (isDuplicate); // Repeat until a unique ID is found

    return uniqueId;
}

module.exports = generateUniqueId;
