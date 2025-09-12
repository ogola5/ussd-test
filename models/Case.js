// models/Case.js
import mongoose from "mongoose";
const CaseSchema = new mongoose.Schema({
  caseNumber: { type: String, unique: true },
  phoneNumber: String,
  description: String,
  status: { type: String, default: "Pending" },
  landType: { type: String, enum: ["TITLED", "SALE_AGREEMENT", "COMMUNITY"] },
  docStatus: { type: String, enum: ["PENDING", "VERIFIED", "NOT_REQUIRED"], default: "PENDING" },
  visibility: { type: String, enum: ["PUBLIC", "PRIVATE"], default: "PRIVATE" },
  alertsEnabled: { type: Boolean, default: true },
  auditTrail: [{ action: String, date: Date }]
}, { timestamps: true });

export default mongoose.model("Case", CaseSchema);
