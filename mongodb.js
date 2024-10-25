// /mongodb.js
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const connectmongodb = async () => {
  while (true) {
    try {
      await mongoose.connect(process.env.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
      break;
    } catch (error) {
      console.error('Error while connecting to MongoDB:', error);
      console.log('Retrying connection in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected! Attempting to reconnect...');
  connectmongodb();
});

module.exports = connectmongodb;
