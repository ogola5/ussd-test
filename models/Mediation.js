import mongoose from 'mongoose';

const MediationSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  county: { type: String, required: true },
  date: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
}, { timestamps: true });

export default mongoose.model('Mediation', MediationSchema);
