import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    county: { type: String },
    language: { type: String, enum: ["en", "sw"], default: "en" },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", ProfileSchema);
