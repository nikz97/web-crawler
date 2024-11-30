import winston from "winston";
import CONFIG from "./../config/index.js";
import { logsNs, logsNskeys } from "./cls-namespaces.js";

// Custom format optimized for local development readability
const localFormat = winston.format.printf(function (info) {
  const date = new Date().toISOString();
  const clsData = {
    ...(info.traceId ? { traceId: info.traceId } : {}),
    ...(info.sessionId ? { sessionId: info.sessionId } : {}),
    ...(info.scheduledCallId ? { scheduledCallId: info.scheduledCallId } : {}),
  };
  
  // Only add CLS data if it exists
  const clsString = Object.keys(clsData).length 
    ? ` - ${JSON.stringify(clsData)}`
    : "";

  return `${date} - ${info.level}: ${info.message}${clsString}\n`;
});

// Add CLS (Continuation Local Storage) data to log entries
const addClsData = winston.format((info) => {
  const traceId = logsNs.get(logsNskeys.TRACE_ID);
  return {
    ...info,
    ...(traceId ? { traceId } : {})
  };
});

// Create logger instance with console transport
const logger = winston.createLogger({
  level: "debug", // Set to debug for detailed local development logging
  format: winston.format.combine(
    winston.format.colorize(), // Add colors for better readability
    addClsData(),
    localFormat
  ),
  transports: [
    new winston.transports.Console()
  ],
  exitOnError: false
});

export default logger;