// models/Profile.js
import mongoose from "mongoose";
const ProfileSchema = new mongoose.Schema({
  phoneNumber: { type: String, unique: true },
  name: String,
  county: String,
  language: { type: String, default: "en" } // 'en', 'sw', etc.
});
export default mongoose.model("Profile", ProfileSchema);
