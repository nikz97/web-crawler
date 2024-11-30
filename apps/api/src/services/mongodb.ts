import mongoose from "mongoose";
import logger from "./../utils/logger.js";
import CONFIG from "./../config/index.js";

const dbConnect = () => {
  const options = {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // Enable Mongoose debugging to log all MongoDB operations
  mongoose.set("debug", (collectionName, method, query, doc) => {
    logger.log(
      "debug",
      `${collectionName}.${method}`,
      JSON.stringify(query),
      doc,
    );
  });

  mongoose.connection.on("connected", () => {
    logger.log("info", "Database connection established.");
  });

  mongoose.connection.on("error", (err) => {
    logger.log("error", `Database connection error: ${err}`);
    mongoose.disconnect();
  });

  mongoose.connection.on("disconnected", () => {
    logger.log("info", "Database disconnected. Reconnecting...");
    connectWithRetry();
  });

  const connectWithRetry = () => {
    mongoose
      .connect(CONFIG.MONGODB_URI, options as mongoose.ConnectOptions)
      .then(
        () => logger.log("info", "Connected to MongoDB!"),
        (err) => logger.log("error", `Connection attempt failed: ${err}`),
      );
  };

  connectWithRetry();
};

export default dbConnect;
