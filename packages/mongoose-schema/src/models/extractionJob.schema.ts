// models/extractionJob.ts
import mongoose from "mongoose";
import { SCHEMA_NAMES } from "../config/constants";

// Create schema without Document extension
const extractionJobSchema = new mongoose.Schema({
  username: String,
  password: String,
  status: String
}, {
  timestamps: true
});

// Create model
export const ExtractionJob = mongoose.model(SCHEMA_NAMES.EXTRACTION_JOB, extractionJobSchema);
