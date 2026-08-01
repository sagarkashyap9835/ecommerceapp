import { Request, Response } from "express";
import Wishlist from "../models/wishlist.js";
import Product from "../models/products.js";

// ===============================
// Get User Wishlist
// GET /api/wishlist
// ===============================
export const getWishlist = async (req: Request, res: Response) => {
  try {
    let wishlist = await Wishlist.findOne({
      user: req.user._id,
    }).populate("products");

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Add Product To Wishlist
// POST /api/wishlist/:productId
// ===============================
export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [],
      });
    }

    const alreadyExists = wishlist.products.some(
      (id: any) => id.toString() === productId
    );

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    wishlist.products.push(product._id);

    await wishlist.save();

    await wishlist.populate("products");

    res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      data: wishlist,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Remove Product From Wishlist
// DELETE /api/wishlist/:productId
// ===============================
export const removeFromWishlist = async (
  req: Request,
  res: Response
) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id: any) => id.toString() !== productId
    );

    await wishlist.save();

    await wishlist.populate("products");

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: wishlist,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Clear Wishlist
// DELETE /api/wishlist
// ===============================
export const clearWishlist = async (
  req: Request,
  res: Response
) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found",
      });
    }

    wishlist.products = [];

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      data: wishlist,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};