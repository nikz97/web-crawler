import mongoose, { Document, Schema } from "mongoose";
import { SCHEMA_NAMES } from "../config/constants.js";

export interface INetworkCall extends Document {
  url: string;
  method: string;
  headers: Record<string, string>;
  resourceType: string;
  postData: string | null;
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body?: string;
  };
}

const networkCallSchema = new mongoose.Schema<INetworkCall>({
  url: { type: String, required: true },
  method: { type: String, required: true },
  headers: {
    type: Map,
    of: String,
    required: true,
    default: {}
  },
  resourceType: { type: String, required: true },
  postData: { type: String, default: null },
  response: {
    type: {
      status: { type: Number, required: true },
      statusText: { type: String, required: true },
      headers: {
        type: Map,
        of: String,
        required: true,
        default: {}
      },
      body: { type: String }
    },
    required: false
  }
});

// Create indexes if needed
networkCallSchema.index({ url: 1 });
networkCallSchema.index({ resourceType: 1 });

export const NetworkCall = 
  mongoose.models[SCHEMA_NAMES.NETWORK_CALL] ||
  mongoose.model<INetworkCall>(
    SCHEMA_NAMES.NETWORK_CALL,
    networkCallSchema
  );