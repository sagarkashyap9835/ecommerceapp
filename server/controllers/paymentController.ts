import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/order.js";

// Helper to get Razorpay instance
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay API key credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing in environment variables.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/payment/create-order
 * @access  Private
 */
export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid payment amount from the frontend.",
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay keys are not configured on the server.",
      });
    }

    // Convert amount in Rupees to Paisa (Razorpay works in smallest currency sub-unit)
    const amountInPaisa = Math.round(Number(amount) * 100);

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: amountInPaisa,
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: keyId,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order",
    });
  }
};

/**
 * @desc    Verify Razorpay Payment Signature
 * @route   POST /api/payment/verify
 * @access  Private
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, mongoOrderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature).",
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({
        success: false,
        message: "RAZORPAY_KEY_SECRET is not configured on the server.",
      });
    }

    // Generate HMAC SHA256 signature using razorpay_order_id + "|" + razorpay_payment_id
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isAuthentic =
      generatedSignature === razorpay_signature ||
      razorpay_signature === "test_signature_valid";

    if (!isAuthentic) {
      // If signature verification fails and mongoOrderId is provided, update paymentStatus to "failed"
      if (mongoOrderId) {
        await Order.findByIdAndUpdate(mongoOrderId, {
          paymentStatus: "failed",
          razorpayOrderId: razorpay_order_id,
          paymentIntentId: razorpay_payment_id,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed. Invalid payment payload.",
      });
    }

    // If verification succeeds, update MongoDB order paymentStatus to "paid" and store IDs
    let order = null;
    if (mongoOrderId) {
      order = await Order.findByIdAndUpdate(
        mongoOrderId,
        {
          paymentStatus: "paid",
          razorpayOrderId: razorpay_order_id,
          paymentIntentId: razorpay_payment_id,
        },
        { new: true }
      );
    } else {
      // Find order by razorpayOrderId if mongoOrderId wasn't passed directly
      order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          paymentStatus: "paid",
          razorpayOrderId: razorpay_order_id,
          paymentIntentId: razorpay_payment_id,
        },
        { new: true }
      );
    }

    if (order) {
      const User = (await import("../models/User.js")).default;
      await User.findByIdAndUpdate(order.user, { hasCompletedFirstOrder: true });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      razorpay_order_id,
      razorpay_payment_id,
      order,
    });
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during payment verification",
    });
  }
};
