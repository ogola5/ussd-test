import express from "express";
import {
  getDashboardStats,
  listCases,
  updateCase,
  listProfiles,
  listWhistles,
  updateWhistleStatus,
  countyAnalytics
} from "../controllers/dashboardController.js";

const router = express.Router();

// Dashboard statistics
router.get("/stats", getDashboardStats);

// Case management
router.get("/cases", listCases);
router.patch("/cases/:id", updateCase);

// Profiles
router.get("/profiles", listProfiles);

// Whistleblower
router.get("/whistles", listWhistles);
router.patch("/whistles/:id", updateWhistleStatus);

// Analytics
router.get("/analytics/county", countyAnalytics);

export default router;
