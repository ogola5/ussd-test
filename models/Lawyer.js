// models/Lawyer.js
import mongoose from "mongoose";

const LawyerSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true },
    email:  { type: String, required: true, unique: true, lowercase: true },
    phone:  { type: String },
    active: { type: Boolean, default: true },
    // optional specialization field
    specialization: String,
  },
  { timestamps: true }
);

export default mongoose.model("Lawyer", LawyerSchema);
