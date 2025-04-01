const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use the environment variable in production, fallback to local in development
    const uri = process.env.MONGODB_URI || 'mongodb+srv://mrtnandya:QelTswFYEYyKPEVo@topnotch.tqmsmks.mongodb.net/restaurant-review-db';
    
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
