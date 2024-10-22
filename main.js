// server.js
const fastify = require('fastify')({ logger: true });
const fastifyCors = require('@fastify/cors');
const connectmongodb = require('./mongodb.js');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Connect to MongoDB
connectmongodb();

// Fix CORS
fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Get IP
fastify.addHook('onRequest', (request, reply, done) => {
  const xForwardedFor = request.headers['x-forwarded-for'];

  fastify.log.info({
    xForwardedFor: xForwardedFor || 'Not provided'
  }, 'Logging X-Forwarded-For header');

  done();
});

// Create HTTP server
const server = createServer(fastify.server);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  }
});

let connectedUsers = 0;

io.on('connection', (socket) => {
  connectedUsers++; 
  fastify.log.info(`A user connected. Total connected users: ${connectedUsers}`);

  io.emit('user count', { count: connectedUsers });

  socket.on('disconnect', () => {
    connectedUsers--; 
    fastify.log.info(`User disconnected. Total connected users: ${connectedUsers}`);

    io.emit('user count', { count: connectedUsers });
  });
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

// /v1/friend/add
const AddFriendRoute = require('./v1/friend/add.js');
fastify.register(AddFriendRoute);

// /v1/friend/accept
const AcceptFriendRoute = require('./v1/friend/accept.js');
fastify.register(AcceptFriendRoute);

// /v1/friend/decline
const DeclineFriendRoute = require('./v1/friend/decline.js');
fastify.register(DeclineFriendRoute);
// websocket incoming friend list
const IncomingFriendRequestsRoute = require('./v1/friend/incoming.js');
fastify.register(IncomingFriendRequestsRoute, {
    io, // Pass the Socket.IO instance
});

// Run the server
const PORT = 3000;
server.listen(PORT, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening on http://localhost:${PORT}`);
});
