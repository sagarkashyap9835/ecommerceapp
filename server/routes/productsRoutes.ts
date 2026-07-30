import express from "express";
import upload from "../middleware/upload.js";
import { protect, authorize } from "../middleware/auth.js";

import {
  getProducts,
  getSingleProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Public Routes
router.get("/", getProducts);
router.get("/:id", getSingleProduct);

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