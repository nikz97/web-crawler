import mongoose from "mongoose";
import logger from "./../utils/logger.js";
import CONFIG from "./../config/index.js";

// Add this line before connection
mongoose.set('bufferCommands', false); // Disable buffering


const dbConnect = async () => {
  // Clear any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  try {
    // Wait for connection
    await mongoose.connect(CONFIG.MONGODB_URI);
    
    // Test the connection with a ping
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      logger.log("info", "MongoDB connected and verified!");
    } else {
      throw new Error("MongoDB connection failed: database not available");
    }
    
    return mongoose.connection;
  } catch (error) {
    logger.log("error", `MongoDB connection error: ${error}`);
    throw error;
  }
};
// Export the connected database instance
export const getDb = async () => {
  if (mongoose.connection.readyState !== 1) {
    await dbConnect();
  }
  return mongoose.connection;
};

export default dbConnect;