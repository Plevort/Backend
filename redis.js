// /redis.js
const { createClient } = require('redis');
const redisClient = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

redisClient.connect().catch(console.error);

module.exports = redisClient;
