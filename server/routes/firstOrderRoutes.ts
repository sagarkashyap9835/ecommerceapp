import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { getSettings, updateSettings, getEligibility } from "../controllers/firstOrderController.js";

const router = express.Router();

// User routes
router.get("/eligibility", protect, getEligibility);
router.get("/settings", getSettings);

// Admin routes
router.put("/settings", protect, authorize("admin"), updateSettings);

export default router;
