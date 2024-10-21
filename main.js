// /main.js
const fastify = require('fastify')({ logger: true })
const connectmongodb = require('./mongodb.js');

// Connect to mongodb
connectmongodb();

// /
const RootRoute = require('./v1/root/root.js');
fastify.register(RootRoute);

// /v1/register
const RegisterRoute = require('./v1/auth/register.js');
fastify.register(RegisterRoute);

// Run the server
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})