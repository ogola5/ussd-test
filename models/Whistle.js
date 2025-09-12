// models/Whistle.js
import mongoose from "mongoose";
const WhistleSchema = new mongoose.Schema({
  county: String,
  description: String,
  anonymous: Boolean,
  contact: String
}, { timestamps: true });
export default mongoose.model("Whistle", WhistleSchema);
