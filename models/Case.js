const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  caseType: { type: String, required: true },   // e.g., "Sexual Abuse", "Land Issue", "Mediation"
  county: { type: String },
  description: { type: String },                // For land issues
  caseNumber: { type: String },                 // For check-case feature
  status: { 
    type: String, 
    enum: ["Pending", "In Progress", "Resolved", "Closed"], 
    default: "Pending" 
  },
  updates: [
    {
      message: String,
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Case', caseSchema);
