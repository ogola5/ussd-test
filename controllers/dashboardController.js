import Case from "../models/Case.js";
import Profile from "../models/Profile.js";
import Mediation from "../models/Mediation.js";
import Whistle from "../models/Whistle.js";
import Lawyer from "../models/Lawyer.js";

/* ========== DASHBOARD ========== */
export const getDashboardStats = async (req, res) => {
  try {
    const totalCases    = await Case.countDocuments();
    const pendingCases  = await Case.countDocuments({ status: "PENDING" });
    const resolvedCases = await Case.countDocuments({ status: "RESOLVED" });
    const courtCases    = await Case.countDocuments({ status: "IN_COURT" });
    const urgentCases   = await Case.countDocuments({ actionToBeTaken: /urgent/i });
    const profiles      = await Profile.countDocuments();
    const whistleCount  = await Whistle.countDocuments();

    const frequentTypes = await Case.aggregate([
      { $group: { _id: "$landType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totals: { totalCases, pendingCases, resolvedCases, courtCases, urgentCases },
      users: profiles,
      whistles: whistleCount,
      frequentTypes
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========== CASES ========== */
// Create a new case (for admin or USSD handler)
export const createCase = async (req, res) => {
  try {
    const created = await Case.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// List / filter cases
export const listCases = async (req, res) => {
  try {
    const { status, county, landType } = req.query;
    const filter = {};
    if (status)   filter.status = status;
    if (county)   filter.county = county;
    if (landType) filter.landType = landType;

    const cases = await Case.find(filter)
      .populate("assignedLawyer", "name email phone specialization")
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single case
export const getCase = async (req, res) => {
  try {
    const found = await Case.findById(req.params.id)
      .populate("assignedLawyer", "name email phone specialization");
    if (!found) return res.status(404).json({ message: "Case not found" });
    res.json(found);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update case (status, notes, actionToBeTaken, assign lawyer, etc.)
export const updateCase = async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("assignedLawyer", "name email phone specialization");
    if (!updated) return res.status(404).json({ message: "Case not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete case
export const deleteCase = async (req, res) => {
  try {
    const deleted = await Case.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Case not found" });
    res.json({ message: "Case deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========== PROFILES ========== */
export const createProfile = async (req, res) => {
  try {
    const profile = await Profile.create(req.body);
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const listProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updated = await Profile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Profile not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const deleted = await Profile.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Profile not found" });
    res.json({ message: "Profile deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========== WHISTLEBLOWER ========== */
export const createWhistle = async (req, res) => {
  try {
    const report = await Whistle.create(req.body);
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const listWhistles = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const reports = await Whistle.find(filter).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateWhistle = async (req, res) => {
  try {
    const updated = await Whistle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Report not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteWhistle = async (req, res) => {
  try {
    const deleted = await Whistle.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========== MEDIATION ========== */
export const createMediation = async (req, res) => {
  try {
    const mediation = await Mediation.create(req.body);
    res.status(201).json(mediation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const listMediations = async (req, res) => {
  try {
    const { caseId } = req.query;
    const filter = caseId ? { caseId } : {};
    const mediations = await Mediation.find(filter).sort({ createdAt: -1 });
    res.json(mediations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMediation = async (req, res) => {
  try {
    const updated = await Mediation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Mediation not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteMediation = async (req, res) => {
  try {
    const deleted = await Mediation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Mediation not found" });
    res.json({ message: "Mediation deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========== ANALYTICS ========== */
export const countyAnalytics = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$county",
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "RESOLVED"] }, 1, 0] } }
        }
      },
      {
        $project: {
          county: "$_id",
          total: 1,
          resolved: 1,
          resolutionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$resolved", "$total"] }, 100] }
            ]
          }
        }
      },
      { $sort: { total: -1 } }
    ];
    const stats = await Case.aggregate(pipeline);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//  ========== LAWYERS ========== /
export const createLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.create(req.body);
    res.status(201).json(lawyer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const listLawyers = async (_req, res) => {
  try {
    const lawyers = await Lawyer.find().sort({ createdAt: -1 });
    res.json(lawyers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateLawyer = async (req, res) => {
  try {
    const updated = await Lawyer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Lawyer not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteLawyer = async (req, res) => {
  try {
    const deleted = await Lawyer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Lawyer not found" });
    res.json({ message: "Lawyer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};