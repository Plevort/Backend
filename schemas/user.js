// /schemas/user.js
const mongoose = require('mongoose');

const isValidUsername = (username) => {
    const minLength = 2;
    const maxLength = 32;
    const invalidSubstrings = ['@', '#', ':', '`', 'plevort', 'everyone', 'here'];
    const trimmedUsername = username.trim().replace(/\s+/g, ' ');

    if (trimmedUsername.length < minLength || trimmedUsername.length > maxLength) {
        return false;
    }

    for (const substring of invalidSubstrings) {
        if (trimmedUsername.toLowerCase().includes(substring)) {
            return false;
        }
    }

    const validCharacters = /^[\p{L}\p{N}_.]+$/u;
    return validCharacters.test(trimmedUsername);
};

const userSchema = new mongoose.Schema({
    uniqueId: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: isValidUsername,
            message: props => `${props.value} is not a valid username!`,
        },
    },
    password: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
    token: {
        type: String,
        required: false,
    },
    friends: {
        type: [String],
        default: [],
    }
}, {
    timestamps: true,
});

userSchema.pre('save', function (next) {
    this.username = this.username.toLowerCase();
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
