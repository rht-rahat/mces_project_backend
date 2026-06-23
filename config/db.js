const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not defined in environment variables.');
    }
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log('MongoDB Connected successfully!');
  } catch (err) {
    isConnected = false;
    console.error('MongoDB Connection Error:', err.message);
  }
};

module.exports = {
  connectDB,
  isConnected: () => isConnected
};
