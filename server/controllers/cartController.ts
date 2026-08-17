// get user cart
// Get /api/cart

import { Request, Response } from "express";
import Cart from "../models/cart.js";
import Product from "../models/products.js";
import { getActiveSale, getEffectiveProductPrice } from "../utils/saleLogic.js";

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

    let activeSale: any = null;
    let firstOrderOffer: any = undefined;

    try {
      activeSale = await getActiveSale();
      const { checkFirstOrderEligibility, getFirstOrderSettings } = await import("../utils/firstOrderLogic.js");
      const isEligible = await checkFirstOrderEligibility(req.user._id);
      if (isEligible) {
        const settings = await getFirstOrderSettings();
        firstOrderOffer = { isEligible, settings };
      }
    } catch (err) {
      console.error("Sale or First Order logic error", err);
    }

    cart.items.forEach((item: any) => {
      if (item.product) {
        const productWithSale = getEffectiveProductPrice((item.product as any).toObject(), activeSale, firstOrderOffer);
        if (productWithSale.sale.isOnSale) {
          item.price = productWithSale.sale.salePrice;
          (item.product as Record<string, any>).sale = productWithSale.sale;
        } else {
          item.price = (item.product as any).price;
        }
      }
    });

    cart.calculateTotal();
    await cart.save();

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
    const { productId, quantity = 1, size = "", color = "" } = req.body;

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
        message: product.stock > 0 ? `Only ${product.stock} units available in stock.` : "This product is currently out of stock.",
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
      (i: any) =>
        i.product.toString() === productId &&
        (i.size || "") === (size || "") &&
        (i.color || "") === (color || "")
    );

    if (item) {
      // Increase quantity
      if (item.quantity + quantity > product.stock) {
        res.status(400).json({
          success: false,
          message: product.stock > 0 ? `Stock limit reached. Maximum ${product.stock} units available.` : "This product is currently out of stock.",
        });
        return;
      }

      item.quantity += quantity;
    } else {
      // Add new item
      const activeSale = await getActiveSale();
      let firstOrderOffer: any = undefined;
      try {
        const { checkFirstOrderEligibility, getFirstOrderSettings } = await import("../utils/firstOrderLogic.js");
        const isEligible = await checkFirstOrderEligibility(req.user._id);
        if (isEligible) {
          const settings = await getFirstOrderSettings();
          firstOrderOffer = { isEligible, settings };
        }
      } catch (err) { }

      const productWithSale = getEffectiveProductPrice(product.toObject(), activeSale, firstOrderOffer);
      const effectivePrice = productWithSale.sale.isOnSale ? productWithSale.sale.salePrice : product.price;

      cart.items.push({
        product: product._id,
        quantity,
        price: effectivePrice,
        size,
        color,
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
    const { quantity, size = "", color = "" } = req.body;

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
        message: product.stock > 0 ? `Stock limit reached. Only ${product.stock} units available.` : "This product is currently out of stock.",
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
      (i: any) =>
        i.product.toString() === productId &&
        (i.size || "") === (size || "") &&
        (i.color || "") === (color || "")
    );

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
      return;
    }

    const activeSale = await getActiveSale();
    let firstOrderOffer: any = undefined;
    try {
      const { checkFirstOrderEligibility, getFirstOrderSettings } = await import("../utils/firstOrderLogic.js");
      const isEligible = await checkFirstOrderEligibility(req.user._id);
      if (isEligible) {
        const settings = await getFirstOrderSettings();
        firstOrderOffer = { isEligible, settings };
      }
    } catch (err) { }

    const productWithSale = getEffectiveProductPrice(product.toObject(), activeSale, firstOrderOffer);
    item.quantity = quantity;
    item.price = productWithSale.sale.isOnSale ? productWithSale.sale.salePrice : product.price;

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
    const { size = "", color = "" } = req.body;

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
      (item: any) =>
        item.product.toString() === productId &&
        (item.size || "") === (size || "") &&
        (item.color || "") === (color || "")
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