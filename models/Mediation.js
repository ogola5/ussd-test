// models/Mediation.js
import mongoose from "mongoose";
const MediationSchema = new mongoose.Schema({
  phoneNumber: String,
  county: String,
  reason: String,
  date: String
});
export default mongoose.model("Mediation", MediationSchema);
