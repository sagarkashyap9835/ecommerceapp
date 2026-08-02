import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/products.js";
import Stripe from "stripe";
export const getOrders = async (req, res) => {
    try {
        const query = { user: req.user._id };
        const orders = await Order.find(query).populate("items.product", "name images").sort("-createdAt");
        res.json({
            success: true,
            data: orders,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// get single orders
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product', 'name images');
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }
        res.json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// create order from cart
export const createOrder = async (req, res) => {
    try {
        const { shippingAddress, notes } = req.body;
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }
        const orderItems = [];
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${item.product.name}`,
                });
            }
            orderItems.push({
                product: item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                size: item.size,
            });
            product.stock -= item.quantity;
            await product.save();
        }
        const subtotal = cart.totalAmount;
        const shippingCost = 20;
        const tax = 0;
        const totalAmount = subtotal + shippingCost + tax;
        const isStripe = req.body.paymentMethod === "stripe";
        const paymentStatus = req.body.paymentStatus || (isStripe ? "paid" : "pending");
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
            paymentIntentId: req.body.paymentIntentId || (isStripe ? "pi_test_" + Date.now() : undefined),
            orderNumber: "ORD-" + Date.now(),
        });
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
        res.status(201).json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Create Stripe Checkout Session (Test Mode Support)
export const createStripeCheckoutSession = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }
        const subtotal = cart.totalAmount;
        const shippingCost = 20;
        const totalAmount = subtotal + shippingCost;
        let sessionUrl = "";
        let sessionId = "cs_test_" + Date.now();
        if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("dummy")) {
            try {
                const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
                    apiVersion: "2024-06-20",
                });
                const lineItems = cart.items.map((item) => ({
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: item.product?.name || "Product",
                            images: item.product?.images ? [item.product.images[0]] : [],
                        },
                        unit_amount: Math.round(item.price * 100),
                    },
                    quantity: item.quantity,
                }));
                const session = await stripeClient.checkout.sessions.create({
                    payment_method_types: ["card"],
                    line_items: lineItems,
                    mode: "payment",
                    success_url: `${req.headers.origin || "http://localhost:8081"}/checkout?payment=success`,
                    cancel_url: `${req.headers.origin || "http://localhost:8081"}/checkout?payment=cancelled`,
                });
                sessionUrl = session.url || "";
                sessionId = session.id;
            }
            catch (stripeErr) {
                console.log("Stripe session creation note:", stripeErr.message);
            }
        }
        res.status(200).json({
            success: true,
            url: sessionUrl,
            sessionId: sessionId,
            amount: totalAmount,
            message: "Stripe payment initialized in Test Mode",
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (orderStatus)
            order.orderStatus = orderStatus;
        if (paymentStatus)
            order.paymentStatus = paymentStatus;
        if (orderStatus === "delivered")
            order.deliveredAt = new Date();
        await order.save();
        res.json({ success: true, data: order });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// get all ordeders
// Get api/orders/admin/all
export const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = {};
        if (status)
            query.orderStatus = status;
        const total = await Order.countDocuments(query);
        const orders = await Order.find(query).populate("user", "name email").populate("items.product", "name").sort("-createdAt").skip((Number(page) - 1) * Number(limit)).limit(Number(limit));
        res.json({
            success: true,
            data: orders,
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
