// main.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const http = require('http');
const connectMongoDB = require('./mongodb.js');
const verifyToken = require('./middleware/verify.js');
const initializeSocket = require('./socket.js');


// express
const app = express();
app.use(express.json());
app.set('trust proxy', true);
app.use(morgan('combined'));
const server = http.createServer(app);

// Connect to MongoDB
connectMongoDB();

// Fix CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// socket.io
const io = initializeSocket(server);
app.set('socketio', io);

// Routes
const LoginRoute = require('./v1/auth/login.js');
app.use('/v1/', LoginRoute);
const RegisterRoute = require('./v1/auth/register.js');
app.use('/v1/', RegisterRoute);
const AddFriendRoute = require('./v1/friend/add.js');
app.use('/v1/friend/', AddFriendRoute);
const AcceptFriendRoute = require('./v1/friend/accept.js');
app.use('/v1/friend/', AcceptFriendRoute);
const DeclineFriendRoute = require('./v1/friend/decline.js');
app.use('/v1/friend/', DeclineFriendRoute);
const FriendsRoute = require('./v1/friend/friends.js');
app.use('/v1/friend/', FriendsRoute);
const IncomingFriendsRoute = require('./v1/friend/incoming.js');
app.use('/v1/friend/', IncomingFriendsRoute);
const DirectmessageCreateRoute = require('./v1/createchat/directmessage.js');
app.use('/v1/createchat/', DirectmessageCreateRoute);
const { router: ChatlistRoute, initializeChatList } = require('./v1/chat/list.js');
initializeChatList(io);
app.use('/v1/chat/', ChatlistRoute, initializeChatList);
const MessageSendRoute = require('./v1/message/send.js');
app.use('/v1/message/', MessageSendRoute);
const MessageReadRoute = require('./v1/message/read.js');
app.use('/v1/message/', MessageReadRoute);

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.info(`Server listening on http://localhost:${PORT}`);
});
