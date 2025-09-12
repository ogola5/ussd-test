import mongoose from "mongoose";

const WhistleSchema = new mongoose.Schema(
  {
    county: { type: String, required: true },
    description: { type: String, required: true },
    anonymous: { type: Boolean, default: true },
    contact: { type: String }, // optional if reporter wants follow-up
    status: {
      type: String,
      enum: ["NEW", "REVIEWED", "ACTIONED", "CLOSED"],
      default: "NEW",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Whistle", WhistleSchema);
