const fastify = require('fastify')({ logger: true });
const fastifyCors = require('@fastify/cors');
const connectmongodb = require('./mongodb.js');

// Connect to MongoDB
connectmongodb();

//fix cors
fastify.register(fastifyCors, {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true 
});

// / (root)
const RootRoute = require('./v1/root/root.js');
fastify.register(RootRoute);

// /v1/register
const RegisterRoute = require('./v1/auth/register.js');
fastify.register(RegisterRoute);
// /v1/login
const loginRoute = require('./v1/auth/login.js');
fastify.register(loginRoute);

// Run the server
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
