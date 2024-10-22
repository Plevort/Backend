// /v1/auth/register.js
const bcrypt = require('bcryptjs');
const User = require('../../schemas/user');
const crypto = require('crypto'); 
const jwt = require('jsonwebtoken'); 
const dotenv = require('dotenv').config();
const checkDuplicateId = require('../../middleware/checkdub.js'); 

async function registerRoute(fastify, options) {
    fastify.post('/v1/register', async (request, reply) => {
        const { email, username, password, passwordConfirm } = request.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return reply.code(400).send({ error: 'Invalid email format' });
        }

        if (!isValidPassword(password)) {
            return reply.code(400).send({
                error: 'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.',
            });
        }

        if (password !== passwordConfirm) {
            return reply.code(400).send({ error: 'Passwords do not match' });
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
                    return reply.code(400).send({ error: 'Email is already taken' });
                }
                if (existingUser.username.toLowerCase() === username.toLowerCase()) {
                    return reply.code(400).send({ error: 'Username is already taken' });
                }
            }

            let uniqueId;
            let isDuplicate;
            do {
                uniqueId = generateUniqueId(); 
                isDuplicate = await checkDuplicateId({ body: { uniqueId } }, reply, () => {});
            } while (isDuplicate);

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

            const token = jwt.sign({ uniqueId: newUser.uniqueId, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

            newUser.token = token;
            await newUser.save();

            reply.code(201).send({
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
                return reply.code(400).send({ error: error.message });
            }
            
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    });
}

function isValidPassword(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUppercase && hasLowercase && hasNumbers && hasSpecialChars;
}

//64 bit
function generateUniqueId() {
    const randomBytes = crypto.randomBytes(8);
    return BigInt('0x' + randomBytes.toString('hex'));
}

module.exports = registerRoute;
