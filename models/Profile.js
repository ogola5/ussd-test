import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, unique: true, index: true },
    name: String,
    county: String,
    language: { type: String, enum: ["en", "sw"], default: "en" },
    languageSet: { type: Boolean, default: false }   // marks if selection done
  },
  { timestamps: true }
);

export default mongoose.model("Profile", ProfileSchema);
