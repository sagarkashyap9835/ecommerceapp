import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import { createSale, updateSale, deleteSale, getAllSales, getActiveSaleEndpoint } from "../controllers/saleController.js";

const router = express.Router();

router.get("/active", getActiveSaleEndpoint);
router.get("/all", protect, authorize("admin"), getAllSales);
router.post("/create", protect, authorize("admin"), createSale);
router.put("/:id", protect, authorize("admin"), updateSale);
router.delete("/:id", protect, authorize("admin"), deleteSale);

export default router;
