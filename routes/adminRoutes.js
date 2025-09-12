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

router.get("/stats", getDashboardStats);
router.get("/cases", listCases);
router.patch("/cases/:id", updateCase);
router.get("/profiles", listProfiles);
router.get("/whistles", listWhistles);
router.patch("/whistles/:id", updateWhistleStatus);
router.get("/analytics/county", countyAnalytics);

export default router;
