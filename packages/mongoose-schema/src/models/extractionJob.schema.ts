import mongoose, { Document, Schema } from "mongoose";
import { CALL_STATUS, SCHEMA_NAMES } from "../config/constants.js";


export interface IExtractionJob extends Document {
  username: string;
  password: string;
  startedAt?: Date;
  completedAt?: Date;
  status: string;
  jsonDumpId?: Schema.Types.ObjectId;
  errorMessage?: string;
}

const extractionJobSchema = new mongoose.Schema<IExtractionJob>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  startedAt: { type: Date },
  completedAt: { type: Date },
  status: {
    type: String,
    enum: Object.values(CALL_STATUS),
    required: true,
  },
  jsonDumpId: {
    type: Schema.Types.ObjectId,
    ref: SCHEMA_NAMES.JSON_DUMP,
  },
  errorMessage: { type: String },
});

export const ExtractionJob =
  mongoose.models[SCHEMA_NAMES.EXTRACTION_JOB] ||
  mongoose.model<IExtractionJob>(
    SCHEMA_NAMES.EXTRACTION_JOB,
    extractionJobSchema,
  );

  export const createExtractionJob = async (data: Partial<IExtractionJob>) => {
    return await ExtractionJob.create(data);
  };