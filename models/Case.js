import mongoose from "mongoose";

const CaseSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, index: true },
    caseNumber: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    landType: {
      type: String,
      enum: ["TITLED", "SALE_AGREEMENT", "COMMUNITY", "OTHER"],
      default: "OTHER",
    },
    status: {
      type: String,
      enum: ["OPEN", "PENDING", "IN_COURT", "RESOLVED", "CLOSED"],
      default: "OPEN",
      index: true,
    },
    notes: String, // optional internal notes for admins
  },
  { timestamps: true }
);

export default mongoose.model("Case", CaseSchema);
