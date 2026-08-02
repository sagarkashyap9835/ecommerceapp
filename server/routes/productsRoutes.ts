import express from "express";
import upload from "../middleware/upload.js";
import { protect, authorize } from "../middleware/auth.js";

import {
  getProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  checkUserCanReview,
  getUserReviews,
  deleteUserReview,
} from "../controllers/productController.js";

const router = express.Router();

// Public Routes
router.get("/", getProducts);
router.get("/user/my-reviews", protect, getUserReviews);
router.get("/:id", getSingleProduct);

// Review Routes
router.post("/:id/reviews", protect, createProductReview);
router.get("/:id/can-review", protect, checkUserCanReview);
router.delete("/:productId/user-review", protect, deleteUserReview);

// Admin Routes
router.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 10),
  createProduct
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.array("images", 10),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteProduct
);

export default router;