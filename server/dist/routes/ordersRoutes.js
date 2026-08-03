import express from "express";
import { getOrders, getOrder, createOrder, getAllOrders, updateOrderStatus, createRazorpayOrder, } from "../controllers/ordersController.js";
import { protect, authorize } from "../middleware/auth.js";
const router = express.Router();
/* ===========================
        ADMIN ROUTES
=========================== */
// Get All Orders
// GET /api/orders/admin/all
router.get("/admin/all", protect, authorize("admin"), getAllOrders);
// Update Order Status
// PUT /api/orders/admin/:id
router.put("/admin/:id", protect, authorize("admin"), updateOrderStatus);
/* ===========================
         USER ROUTES
=========================== */
// Get Logged In User Orders
// GET /api/orders
router.get("/", protect, getOrders);
// Create Razorpay Order
// POST /api/orders/create-razorpay-order
router.post("/create-razorpay-order", protect, createRazorpayOrder);
// Create Order
// POST /api/orders
router.post("/", protect, createOrder);
// Get Single Order
// GET /api/orders/:id
router.get("/:id", protect, getOrder);
export default router;
