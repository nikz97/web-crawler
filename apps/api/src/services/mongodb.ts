// mongodb.ts
import mongoose from "mongoose";
import logger from "./../utils/logger.js";
import CONFIG from "./../config/index.js";
import { ExtractionJob } from "@repo/mongoose-schema";

mongoose.set('bufferTimeoutMS', 30000);  // Increase buffer timeout

let isConnected = false;

const connectDB = async () => {
  try {
    if (!isConnected) {
      logger.log("info", "Attempting to connect to MongoDB...");
      logger.log("info", `Connection URI: ${CONFIG.MONGODB_URI.replace(/\/\/[^@]+@/, '//<credentials>@')}`);

      const connection = await mongoose.connect(CONFIG.MONGODB_URI);
      
      // Test the connection
      await connection.connection.db?.admin().ping();
      
      isConnected = true;
      logger.log("info", "MongoDB connection successful and verified");
    }
    return mongoose.connection;
  } catch (error) {
    isConnected = false;
    logger.log("error", `MongoDB connection error: ${error}`);
    throw error;
  }
};

mongoose.connection.on('connected', () => {
  logger.log("info", "Mongoose 'connected' event fired");
  isConnected = true;
});

mongoose.connection.on('disconnected', () => {
  logger.log("warn", "Mongoose 'disconnected' event fired");
  isConnected = false;
});

mongoose.connection.on('error', (error) => {
  logger.log("error", `Mongoose error event: ${error}`);
  isConnected = false;
});

export const getDb = async () => {
  if (!isConnected || mongoose.connection.readyState !== 1) {
    logger.log("info", `Reconnecting to MongoDB (current state: ${mongoose.connection.readyState})`);
    return connectDB();
  }
  return mongoose.connection;
};

export default getDb;