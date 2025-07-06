const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // ✔️ modern driver, no deprecated flags
      dbName: process.env.MONGO_DB || 'test', // optional: default DB
      autoIndex: true,                        // create indexes (turn off in prod if needed)
      connectTimeoutMS: 10_000,               // fail fast if the network is bad
    });

    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
