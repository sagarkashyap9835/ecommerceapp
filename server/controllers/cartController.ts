// get user cart
// Get /api/cart

import { Request, Response } from "express";
import Cart from "../models/cart.js";
import Product from "../models/products.js";
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


export const addToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, quantity = 1, size = "" } = req.body;

    // Validate Product
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    // Check Stock
    if (quantity > product.stock) {
      res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
      return;
    }

    // Find User Cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalAmount: 0,
      });
    }

    // Check if product already exists in cart
    const item = cart.items.find(
      (i) =>
        i.product.toString() === productId &&
        (i.size || "") === (size || "")
    );

    if (item) {
      // Increase quantity
      if (item.quantity + quantity > product.stock) {
        res.status(400).json({
          success: false,
          message: "Stock limit exceeded",
        });
        return;
      }

      item.quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
        size,
      });
    }

    // Update Total
    cart.calculateTotal();

    await cart.save();

    await cart.populate(
      "items.product",
      "name images price stock"
    );

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// update item to cart
// put /api/cart/item/:productId




export const updateCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { quantity, size = "" } = req.body;

    if (!quantity || quantity < 1) {
      res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
      return;
    }

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    if (quantity > product.stock) {
      res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
      return;
    }

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
      return;
    }

    const item = cart.items.find(
      (i) =>
        i.product.toString() === productId &&
        (i.size || "") === (size || "")
    );

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
      return;
    }

    item.quantity = quantity;
    item.price = product.price;

    cart.calculateTotal();

    await cart.save();

    await cart.populate(
      "items.product",
      "name images price stock"
    );

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove Item from cart
// delete /api/cart/item/:productId

export const removeCartItem = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { size = "" } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
      return;
    }

    // Find item index
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (item.size || "") === (size || "")
    );

    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
      return;
    }

    // Remove item
    cart.items.splice(itemIndex, 1);

    // Recalculate total
    cart.calculateTotal();

    await cart.save();

    await cart.populate(
      "items.product",
      "name images price stock"
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// clear cart


export const clearCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
      return;
    }

    // Remove all items
    cart.items = [];

    // Reset total amount
    cart.totalAmount = 0;

    // OR
    // cart.calculateTotal();

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};