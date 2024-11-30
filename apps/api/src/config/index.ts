import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
  PORT?: number;
  NODE_ENV?: string;
  MONGODB_URI?: string;
  WHITELIST?: string;
  REDIS_URL?: string;
  INSTAGRAM_PASSWORD?: string;
}

let envConfig: EnvConfig = {};
try {
  envConfig = JSON.parse(process.env.ENV || "{}") as EnvConfig; // Default to empty object if ENV is not set
} catch (error) {
  console.error("Error parsing ENV:", error);
}

// Create the CONFIG object
const CONFIG = {
  PORT: envConfig.PORT || process.env.PORT || 3000,
  NODE_ENV: envConfig.NODE_ENV || process.env.NODE_ENV || "local",
  MONGODB_URI:
    envConfig.MONGODB_URI ||
    process.env.MONGODB_URI ||
    "mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/yourdb",
  REDIS_URL:
    envConfig.REDIS_URL || process.env.REDIS_URL || "redis://localhost:6379",
  WHITELIST:
    envConfig.WHITELIST ||
    process.env.WHITELIST ||
    "http://localhost:3000",
  INSTAGRAM_PASSWORD:
    envConfig.INSTAGRAM_PASSWORD || process.env.INSTAGRAM_PASSWORD || "your_instagram_password",
};

export default CONFIG;
