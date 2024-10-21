// /v1/root/root.js

async function RootRoute(fastify, options) {
    fastify.get('/', async function (request, reply) {
      return { hello: 'world' };
    });
  }

module.exports = RootRoute;