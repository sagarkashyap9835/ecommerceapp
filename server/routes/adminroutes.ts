import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Dashboard Stats
// GET /api/admin/dashboard
router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getDashboardStats
);

export default router;