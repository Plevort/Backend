// /middleware/maketoken.js
const jwt = require('jsonwebtoken');

function createToken(userId, email) {
  const payload = {
    uniqueId: userId,
    email: email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET);

  return token;
}

module.exports = createToken;
