const mongoose = require('mongoose');

const mediationSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  county: { type: String, required: true },
  date: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mediation', mediationSchema);
