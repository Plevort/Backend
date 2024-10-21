// /main.js
const fastify = require('fastify')({ logger: true })
const connectmongodb = require('./mongodb.js');

// Connect to mongodb
connectmongodb();

// /
const RootRoute = require('./v1/root/root.js');
fastify.register(RootRoute);

// Run the server
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})