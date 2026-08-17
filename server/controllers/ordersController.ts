import { Request, Response } from "express";
import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/products.js";
import Razorpay from "razorpay";
import { getActiveSale, getEffectiveProductPrice } from "../utils/saleLogic.js";
export const getOrders = async (req: Request, res: Response) => {
    try {
        const query = { user: req.user._id }
        const orders = await Order.find(query).populate("items.product", "name images").sort("-createdAt");

        res.json({
            success: true,
            data: orders,
        })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}
// get single orders

export const getOrder = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product', 'name images');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        res.json({ success: true, data: order });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// create order from cart


export const createOrder = async (req: Request, res: Response) => {
    try {
        const { shippingAddress, notes } = req.body;
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const activeSale = await getActiveSale();

        let firstOrderOffer = { isEligible: false, settings: null } as any;
        const { checkFirstOrderEligibility, getFirstOrderSettings } = await import("../utils/firstOrderLogic.js");
        const isEligible = await checkFirstOrderEligibility(req.user._id);
        if (isEligible) {
            const settings = await getFirstOrderSettings();
            firstOrderOffer = { isEligible, settings };
        }

        const orderItems = [];
        let calculatedSubtotal = 0;

        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);

            if (!product || product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${(item.product as any).name}`,
                });
            }

            // Recalculate dynamic sale price
            const productWithSale = getEffectiveProductPrice(product.toObject(), activeSale, firstOrderOffer);
            const finalItemPrice = productWithSale.sale.isOnSale ? productWithSale.sale.salePrice : product.price;

            orderItems.push({
                product: item.product._id,
                name: (item.product as any).name,
                quantity: item.quantity,
                price: finalItemPrice,
                saleDetails: productWithSale.sale.isOnSale ? {
                    originalPrice: product.price,
                    salePrice: productWithSale.sale.salePrice,
                    discountAmount: productWithSale.sale.discountAmount,
                    finalItemPrice: finalItemPrice,
                    saleName: productWithSale.sale.saleName,
                    discountType: productWithSale.sale.discountType,
                    firstOrderDiscount: productWithSale.sale.discountType === "FIRST_ORDER" ? productWithSale.sale.discountAmount : undefined
                } : undefined,
                size: item.size,
                color: item.color,
            });

            calculatedSubtotal += (finalItemPrice * item.quantity);

            product.stock -= item.quantity;
            await product.save();
        }

        const subtotal = calculatedSubtotal;
        const shippingCost = 0;
        const tax = 0;
        const totalAmount = subtotal + shippingCost + tax;

        const isRazorpay = req.body.paymentMethod === "razorpay";
        const paymentStatus = req.body.paymentStatus || (isRazorpay ? "paid" : "pending");

        // If paying via 'cash' (COD), the order is successfully placed immediately, consume First Order Offer
        if (paymentStatus === "pending" && !isRazorpay && firstOrderOffer.isEligible && isEligible) {
            // mark user as having completed first order
            const User = (await import("../models/User.js")).default;
            await User.findByIdAndUpdate(req.user._id, { hasCompletedFirstOrder: true });
        } else if (paymentStatus === "paid" && firstOrderOffer.isEligible && isEligible) {
            const User = (await import("../models/User.js")).default;
            await User.findByIdAndUpdate(req.user._id, { hasCompletedFirstOrder: true });
        }

        // Calculate guaranteed 3-day district delivery date
        const estimatedDeliveryDate = req.body.estimatedDeliveryDate
            ? new Date(req.body.estimatedDeliveryDate)
            : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            paymentMethod: req.body.paymentMethod || "cash",
            paymentStatus: paymentStatus,
            subtotal,
            shippingCost,
            tax,
            totalAmount,
            notes,
            estimatedDeliveryDate,
            paymentIntentId: req.body.paymentIntentId || (isRazorpay ? "pay_test_" + Date.now() : undefined),
            razorpayOrderId: req.body.razorpayOrderId || (isRazorpay ? "order_test_" + Date.now() : undefined),
            orderNumber: "ORD-" + Date.now(),
        });

        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        res.status(201).json({ success: true, data: order });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create Razorpay Order (Test Mode Support)
export const createRazorpayOrder = async (req: Request, res: Response) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const activeSale = await getActiveSale();

        let firstOrderOffer = { isEligible: false, settings: null } as any;
        const { checkFirstOrderEligibility, getFirstOrderSettings } = await import("../utils/firstOrderLogic.js");
        const isEligible = await checkFirstOrderEligibility(req.user._id);
        if (isEligible) {
            const settings = await getFirstOrderSettings();
            firstOrderOffer = { isEligible, settings };
        }

        let calculatedSubtotal = 0;
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            if (!product) continue;

            const productWithSale = getEffectiveProductPrice(product.toObject(), activeSale, firstOrderOffer);
            const finalItemPrice = productWithSale.sale.isOnSale ? productWithSale.sale.salePrice : product.price;
            calculatedSubtotal += (finalItemPrice * item.quantity);
        }

        const subtotal = calculatedSubtotal;
        const shippingCost = 0;
        const totalAmount = subtotal + shippingCost;
        const amountInPaisa = Math.round(totalAmount * 100);

        let razorpayOrderId = "order_test_" + Date.now();
        let currency = "INR";

        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (keyId && keySecret && !keyId.includes("dummy")) {
            try {
                const razorpay = new Razorpay({
                    key_id: keyId,
                    key_secret: keySecret,
                });

                const options = {
                    amount: amountInPaisa,
                    currency: "INR",
                    receipt: "receipt_" + Date.now(),
                };

                const order = await razorpay.orders.create(options);
                razorpayOrderId = order.id;
                currency = order.currency;
            } catch (razorpayErr: any) {
                console.log("Razorpay order creation note:", razorpayErr.message);
            }
        }

        res.status(200).json({
            success: true,
            orderId: razorpayOrderId,
            amount: totalAmount,
            amountInPaisa: amountInPaisa,
            currency: currency,
            keyId: keyId || "rzp_test_dummyKeyId12345",
            message: "Razorpay order initialized in Test Mode",
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const order = await Order.findById(req.params.id)

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" })
        }

        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        if (orderStatus === "delivered") order.deliveredAt = new Date()

        await order.save();
        res.json({ success: true, data: order });

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// get all ordeders
// Get api/orders/admin/all
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 20, status } = req.query
        const query: any = {}

        if (status) query.orderStatus = status;

        const total = await Order.countDocuments(query)

        const orders = await Order.find(query).populate("user", "name email").populate("items.product", "name").sort("-createdAt").skip((Number(page) - 1) * Number(limit)).limit(Number(limit));

        res.json({
            success: true,
            data: orders,
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
        })

    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Cancel Order (User Feature with Stock Restoration & Refund)
export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized to cancel this order" });
        }

        if (order.orderStatus !== "placed" && order.orderStatus !== "processing") {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled because it is already ${order.orderStatus}.`,
            });
        }

        // Restore Stock Quantities
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity },
            });
        }

        order.orderStatus = "cancelled";
        order.cancelledAt = new Date();
        order.cancellationReason = reason || "Cancelled by customer";

        // Handle Refund for prepaid orders
        if (order.paymentStatus === "paid") {
            order.paymentStatus = "refunded";
            order.refundAmount = order.totalAmount;
            order.refundId = "ref_test_" + Date.now();
        }

        await order.save();

        res.json({
            success: true,
            data: order,
            message: order.paymentStatus === "refunded"
                ? `Order cancelled successfully. Refund of ₹${order.totalAmount} initiated.`
                : "Order cancelled successfully.",
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Request 2-Day Replacement (User Feature)
export const requestReplacement = async (req: Request, res: Response) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to request replacement" });
        }

        if (order.orderStatus !== "delivered") {
            return res.status(400).json({
                success: false,
                message: "Replacement can only be requested for delivered orders.",
            });
        }

        // Validate 2-Day Replacement Window (48 hours)
        const deliveryTime = order.deliveredAt ? new Date(order.deliveredAt).getTime() : new Date(order.updatedAt).getTime();
        const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
        const isEligible = (Date.now() - deliveryTime) <= twoDaysInMs;

        if (!isEligible) {
            return res.status(400).json({
                success: false,
                message: "The 2-day replacement window for this order has expired.",
            });
        }

        order.replacementRequest = {
            status: "pending",
            reason: reason || "Defect / Size issue reported by customer",
            requestedAt: new Date(),
        };

        await order.save();

        res.json({
            success: true,
            data: order,
            message: "2-Day Replacement request submitted successfully. Our team will contact you shortly.",
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Replacement Status (Admin)
export const updateReplacementStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status." });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (!order.replacementRequest || order.replacementRequest.status === "none") {
            return res.status(400).json({ success: false, message: "No replacement requested for this order." });
        }

        order.replacementRequest.status = status;
        await order.save();

        res.json({
            success: true,
            data: order,
            message: `Replacement request has been ${status}.`
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
