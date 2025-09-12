// controllers/dashboardController.js
import Case from "../models/Case.js";
import Profile from "../models/Profile.js";
import Mediation from "../models/Mediation.js";
import Whistle from "../models/Whistle.js";

/**
 * 1. High-level statistics for the dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalCases    = await Case.countDocuments();
    const pendingCases  = await Case.countDocuments({ status: "Pending" });
    const resolvedCases = await Case.countDocuments({ status: "Resolved" });
    const courtCases    = await Case.countDocuments({ status: "Court" });
    const urgentCases   = await Case.countDocuments({ priority: "High" });
    const profiles      = await Profile.countDocuments();
    const whistleCount  = await Whistle.countDocuments();

    // Group most frequent land dispute types
    const frequentTypes = await Case.aggregate([
      { $group: { _id: "$landType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totals: { totalCases, pendingCases, resolvedCases, courtCases, urgentCases },
      users:  profiles,
      whistles: whistleCount,
      frequentTypes
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * 2. List & filter cases with query params
 *    e.g. /api/admin/cases?status=Pending&county=Kisumu
 */
export const listCases = async (req, res) => {
  try {
    const { status, county, landType } = req.query;
    const filter = {};
    if (status)   filter.status = status;
    if (county)   filter.county = county;
    if (landType) filter.landType = landType;

    const cases = await Case.find(filter).sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * 3. Update a case (status, priority, notes, etc.)
 */
export const updateCase = async (req, res) => {
  try {
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Case not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * 4. Profiles listing
 */
export const listProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * 5. Whistleblower reports with triage status
 *    Add a "status" field to Whistle model: e.g. {status: "New"|"Investigating"|"Closed"}
 */
export const listWhistles = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const reports = await Whistle.find(filter).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateWhistleStatus = async (req, res) => {
  try {
    const updated = await Whistle.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Report not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * 6. Interesting analytics: cases per county and resolution rates
 */
export const countyAnalytics = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$county",
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          }
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
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
