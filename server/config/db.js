const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri && process.env.NODE_ENV === 'production') {
      console.error('FATAL ERROR: MONGO_URI is not defined in production environment variables.');
      process.exit(1);
    }

    if (!mongoUri) {
      console.log('No MONGO_URI found, and not in production. Checking for local MongoDB...');
      // Fallback for local development only
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/investments');
      console.log(`Local MongoDB Connected: ${conn.connection.host}`);
      return;
    }

    console.log('Attempting to connect to MongoDB Atlas...');
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`PRODUCTION DATABASE ERROR: ${error.message}`);
      process.exit(1);
    }

    // Dev fallback for memory server
    if (error.message.includes('ECONNREFUSED')) {
      console.log('Local MongoDB not found. Spinning up a temporary Memory Server for development...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        const memoryConn = await mongoose.connect(uri);
        console.log(`Memory MongoDB Connected: ${memoryConn.connection.host}`);
      } catch (memError) {
        console.error('Failed to start Memory Server:', memError.message);
        process.exit(1);
      }
    } else {
      console.error(`Database Connection Error: ${error.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
