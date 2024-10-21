// /main.js
const fastify = require('fastify')({ logger: true })
const connectmongodb = require('./mongodb.js');

// Connect to mongodb
connectmongodb();

fastify.get('/', function handler (request, reply) {
  reply.send({ hello: 'world' })
})

// Run the server
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})