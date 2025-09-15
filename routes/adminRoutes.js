// routes/adminRoutes.js
import express from "express";
import {
  getDashboardStats,
  listCases, createCase, updateCase, deleteCase,
  listProfiles, createProfile, updateProfile, deleteProfile,
  listWhistles, createWhistle, updateWhistle, deleteWhistle,
  countyAnalytics,
  // --- newly added ---
  listLawyers, createLawyer, updateLawyer, deleteLawyer,
  listMediations, createMediation, updateMediation, deleteMediation
} from "../controllers/dashboardController.js";

const router = express.Router();

/* ===== Dashboard & Analytics ===== */
router.get("/stats", getDashboardStats);
router.get("/analytics/county", countyAnalytics);

/* ===== Cases ===== */
router.get("/cases", listCases);
router.post("/cases", createCase);
router.patch("/cases/:id", updateCase);
router.delete("/cases/:id", deleteCase);

/* ===== Profiles ===== */
router.get("/profiles", listProfiles);
router.post("/profiles", createProfile);
router.put("/profiles/:id", updateProfile);
router.delete("/profiles/:id", deleteProfile);

/* ===== Whistleblower ===== */
router.get("/whistles", listWhistles);
router.post("/whistles", createWhistle);
router.patch("/whistles/:id", updateWhistle);
router.delete("/whistles/:id", deleteWhistle);

/* ===== Lawyers ===== */
router.get("/lawyers", listLawyers);
router.post("/lawyers", createLawyer);
router.put("/lawyers/:id", updateLawyer);
router.delete("/lawyers/:id", deleteLawyer);

/* ===== Mediations ===== */
router.get("/mediations", listMediations);
router.post("/mediations", createMediation);
router.patch("/mediations/:id", updateMediation);
router.delete("/mediations/:id", deleteMediation);

export default router;
