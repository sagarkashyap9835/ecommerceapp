// get user cart
// Get /api/cart

import { Request, Response } from "express";
import Cart from "../models/cart.js";

export const getUserCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name images price stock"
    );

    // Agar cart nahi hai to naya cart create karo
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalAmount: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// add item to cart
// post/api/cart/add



// update item to cart
// put /api/cart/item/:productId



// Remove Item from cart
// delete /api/cart/item/:productId



// clear cart
// delete /api/cart