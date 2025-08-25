const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const Profile = require("../models/Profile");
const Mediation = require("../models/Mediation");

// ✅ Get all cases
router.get("/cases", async (req, res) => {
  try {
    const cases = await Case.find().sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update case status
router.patch("/cases/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "In Progress", "Resolved", "Closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(updatedCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add case update (like progress notes)
router.post("/cases/:id/updates", async (req, res) => {
  try {
    const { message } = req.body;
    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      { $push: { updates: { message } } },
      { new: true }
    );
    res.json(updatedCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all profiles
router.get("/profiles", async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get all mediations
router.get("/mediations", async (req, res) => {
  try {
    const mediations = await Mediation.find().sort({ createdAt: -1 });
    res.json(mediations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
