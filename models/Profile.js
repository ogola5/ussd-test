import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  county: { type: String, required: true },
  role: { type: String, enum: ["User", "Admin"], default: "User" },
}, { timestamps: true });

export default mongoose.model('Profile', ProfileSchema);
