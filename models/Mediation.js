import mongoose from "mongoose";

const MediationSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
    mediatorName: String,
    scheduledDate: Date,
    outcome: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Mediation", MediationSchema);
