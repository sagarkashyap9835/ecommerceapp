import express from "express";
import { createPaymentOrder, verifyPayment } from "../controllers/paymentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// POST /api/payment/create-order
router.post("/create-order", protect, createPaymentOrder);

// POST /api/payment/verify
router.post("/verify", protect, verifyPayment);

export default router;
