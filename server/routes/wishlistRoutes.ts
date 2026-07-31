import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get logged in user's wishlist
// GET /api/wishlist
router.get("/", protect, getWishlist);

// Add product to wishlist
// POST /api/wishlist/:productId
router.post("/:productId", protect, addToWishlist);

// Remove product from wishlist
// DELETE /api/wishlist/:productId
router.delete("/:productId", protect, removeFromWishlist);

// Clear wishlist
// DELETE /api/wishlist
router.delete("/", protect, clearWishlist);

export default router;