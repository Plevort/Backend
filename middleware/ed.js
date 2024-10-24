// middleware/ed.js
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config(); 

const ALGORITHM = process.env.ENC_TWO;
const IV_LENGTH = 16; 

const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = Buffer.from(process.env.ENCRYPTION_KEY, process.env.ENC_THREE);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, process.env.ENC_ONE, process.env.ENC_THREE);
    encrypted += cipher.final(process.env.ENC_THREE);
    return iv.toString(process.env.ENC_THREE) + ':' + encrypted; 
};

const decrypt = (encryptedText) => {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift(), process.env.ENC_THREE);
    const key = Buffer.from(process.env.ENCRYPTION_KEY, process.env.ENC_THREE);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(parts.join(':'), process.env.ENC_THREE, process.env.ENC_ONE);
    decrypted += decipher.final(process.env.ENC_ONE);
    return decrypted;
};

module.exports = { encrypt, decrypt };
