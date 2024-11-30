import mongoose from "mongoose";
import { SCHEMA_NAMES } from "../config/constants.js";

const jsonDumpSchema = new mongoose.Schema({
  data: { type: mongoose.Schema.Types.Mixed, required: true },
});

export const JSONDump =
  mongoose.models[SCHEMA_NAMES.JSON_DUMP] ||
  mongoose.model(SCHEMA_NAMES.JSON_DUMP, jsonDumpSchema);
