// /v1/auth/login.js
const bcrypt = require('bcryptjs');
const User = require('../../schemas/user'); 
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

async function loginRoute(fastify, options) {
  fastify.post('/v1/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return reply.code(400).send({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await bcrypt.compare(password + process.env.BCRYPT_SECRET_PASSWORD, user.password);

      if (!isPasswordValid) {
        return reply.code(400).send({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ uniqueId: user.uniqueId, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      user.token = token; 
      await user.save(); 

      return reply.code(200).send({
        message: 'Login successful',
        token, 
      });
      
    } catch (error) {
      console.error('Error during login:', error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
}

module.exports = loginRoute;
