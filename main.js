// main.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const connectMongoDB = require('./mongodb.js');
const verifyToken = require('./middleware/verify.js');

//express
const app = express();
app.use(express.json());
//because cloudflared
app.set('trust proxy', true);
//logging
app.use(morgan('combined'));
const server = http.createServer(app);

// Connect to MongoDB
connectMongoDB();

// Fix CORS
app.use(cors({
  origin: '*',  // Update to specific origins in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));



// /v1/login
const LoginRoute = require('./v1/auth/login.js');
app.use('/v1/', LoginRoute);
// /v1/register
const RegisterRoute = require('./v1/auth/register.js');
app.use('/v1/', RegisterRoute);
// /v1/friend/add
const AddFriendRoute = require('./v1/friend/add.js');
app.use('/v1/friend/', AddFriendRoute);
// /v1/friend/accept
const AcceptFriendRoute = require('./v1/friend/accept.js');
app.use('/v1/friend/', AcceptFriendRoute);
// /v1/friend/decline
const DeclineFriendRoute = require('./v1/friend/decline.js');
app.use('/v1/friend/', DeclineFriendRoute);

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.info(`Server listening on http://localhost:${PORT}`);
});
