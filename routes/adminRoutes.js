import express from "express";
import { protect } from "../middleware/authMiddleware.js";
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

router.get("/stats", protect, getDashboardStats);
router.get("/cases", protect, listCases);
router.patch("/cases/:id", protect, updateCase);
router.get("/profiles", protect, listProfiles);
router.get("/whistles", protect, listWhistles);
router.patch("/whistles/:id", protect, updateWhistleStatus);
router.get("/analytics/county", protect, countyAnalytics);

export default router;
