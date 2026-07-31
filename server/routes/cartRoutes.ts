import express from "express";

import {
  getUserCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get Logged In User Cart
// GET /api/cart
router.get("/", protect, getUserCart);

// Add Item To Cart
// POST /api/cart/add
router.post("/add", protect, addToCart);

// Update Cart Item
// PUT /api/cart/item/:productId
router.put("/item/:productId", protect, updateCartItem);

// Remove Item From Cart
// DELETE /api/cart/item/:productId
router.delete("/item/:productId", protect, removeCartItem);

// Clear Cart
// DELETE /api/cart
router.delete("/", protect, clearCart);

export default router;