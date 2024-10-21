// /mongodb.js
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

//mongodb connection
const connectmongodb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to mongodb');
  } catch (error) {
    console.error('error while connecting to mongodb:', error);
    process.exit(1);
  }
};

module.exports = connectmongodb;
