import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get all addresses of logged in user
// GET /api/address
router.get("/", protect, getAddresses);

// Add new address
// POST /api/address
router.post("/", protect, addAddress);

// Update address
// PUT /api/address/:id
router.put("/:id", protect, updateAddress);

// Delete address
// DELETE /api/address/:id
router.delete("/:id", protect, deleteAddress);

export default router;