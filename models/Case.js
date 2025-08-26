import mongoose from 'mongoose';

const StatusUpdateSchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['submitted', 'in_review', 'resolved', 'rejected'], 
    required: true 
  },
  note: { type: String },
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: false }, // optional
  at: { type: Date, default: Date.now },
}, { _id: false });

const CaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: false }, // optional now
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['land', 'gbv', 'other'], required: true },
  county: { type: String, required: true },
  location: { type: String },
  partiesInvolved: [{ name: String, contact: String }],
  gbvRelated: { type: Boolean, default: false },
  evidenceFiles: [{ filename: String, url: String }], // future: S3/Cloudinary
  status: { type: String, enum: ['submitted', 'in_review', 'resolved', 'rejected'], default: 'submitted' },
  statusHistory: { type: [StatusUpdateSchema], default: [] },
}, { timestamps: true });

// Index for analytics & filtering
CaseSchema.index({ type: 1, county: 1, status: 1, createdAt: -1 });

export default mongoose.model('Case', CaseSchema);
