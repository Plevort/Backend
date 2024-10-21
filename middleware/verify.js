const jwt = require('jsonwebtoken');
const User = require('../../schemas/user');

async function verifyToken(request, reply, done) {
  const token = request.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return reply.code(403).send({ error: 'Access denied, token missing!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ uniqueId: decoded.uniqueId });

    if (!user || user.token !== token) { 
      return reply.code(401).send({ error: 'Invalid token' });
    }

    request.user = decoded; 
    done();
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}

module.exports = verifyToken;
