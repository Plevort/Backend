const fastify = require('fastify')({ logger: true });
const fastifyCors = require('@fastify/cors');
const connectmongodb = require('./mongodb.js');

//connect to mongodb
connectmongodb();

//fix cors
fastify.register(fastifyCors, {
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true 
});

//get ip
fastify.addHook('onRequest', (request, reply, done) => {
  const xForwardedFor = request.headers['x-forwarded-for'];

  fastify.log.info({
    xForwardedFor: xForwardedFor || 'Not provided'
  }, 'Logging X-Forwarded-For header');

  done();
});



// /
const RootRoute = require('./v1/root/root.js');
fastify.register(RootRoute);

// /v1/register
const RegisterRoute = require('./v1/auth/register.js');
fastify.register(RegisterRoute);
// /v1/login
const LoginRoute = require('./v1/auth/login.js');
fastify.register(LoginRoute);

// Run the server
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
