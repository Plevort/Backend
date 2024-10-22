// Import required packages
const fastify = require('fastify')({ logger: true });
const fastifyCors = require('@fastify/cors');
const connectmongodb = require('./mongodb.js');
const fastifySocketIO = require('fastify-socket.io');  // Import the plugin
const verifyToken = require('./middleware/verify.js');

// Connect to MongoDB
connectmongodb();

// Fix CORS
fastify.register(fastifyCors, {
  origin: '*',  // Update to specific origins in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

// Register the Socket.IO plugin with Fastify
fastify.register(fastifySocketIO, {
  cors: {
    origin: '*', // Adjust according to your needs
    methods: ['GET', 'POST'],
  }
});

// User connection management
let connectedUsers = 0;

// Handle WebSocket connections
fastify.ready().then(() => {
  fastify.io.on('connection', (socket) => {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];

    if (!token) {
      fastify.log.error('No token provided, disconnecting socket.');
      return socket.disconnect(true);
    }

    try {
      const decoded = verifyToken(token);  // Ensure verifyToken works synchronously for WebSocket
      socket.user = decoded;  // Attach user info to socket after verification
      connectedUsers++;

      fastify.log.info(`User ${socket.user.uniqueId} connected. Total connected users: ${connectedUsers}`);

      // Each user joins a room named after their user ID
      socket.join(socket.user.uniqueId);
      fastify.log.info(`User ${socket.user.uniqueId} joined room ${socket.user.uniqueId}`);

      // Emit the updated user count to all connected clients
      fastify.io.emit('user count', { count: connectedUsers });

      // Handle disconnect event
      socket.on('disconnect', () => {
        connectedUsers--;
        fastify.log.info(`User ${socket.user.uniqueId} disconnected. Total connected users: ${connectedUsers}`);
        fastify.io.emit('user count', { count: connectedUsers });
      });
    } catch (error) {
      fastify.log.error('Invalid token, disconnecting socket.', error);
      socket.disconnect(true);
    }
  });
});

// Register HTTP Routes
const RootRoute = require('./v1/root/root.js');
fastify.register(RootRoute);

// Register additional routes
const RegisterRoute = require('./v1/auth/register.js');
fastify.register(RegisterRoute);

const LoginRoute = require('./v1/auth/login.js');
fastify.register(LoginRoute);

const AddFriendRoute = require('./v1/friend/add.js');
fastify.register(AddFriendRoute);

const AcceptFriendRoute = require('./v1/friend/accept.js');
fastify.register(AcceptFriendRoute);

const DeclineFriendRoute = require('./v1/friend/decline.js');
fastify.register(DeclineFriendRoute);

const IncomingFriendRequestsRoute = require('./v1/friend/incoming.js');
fastify.register(IncomingFriendRequestsRoute);

const FriendsRoute = require('./v1/friend/friends.js');
fastify.register(FriendsRoute);

// Start the server
const PORT = 3000;
const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server listening on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Start the Fastify server
start();
