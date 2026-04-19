const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/investments');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('Local MongoDB not found. Spinning up a temporary Cloud-like Memory Server...');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();

      const memoryConn = await mongoose.connect(mongoUri);
      console.log(`Memory MongoDB Connected successfully: ${memoryConn.connection.host}`);
    } else {
      console.error(`Error connecting to MongoDB: ${error.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
