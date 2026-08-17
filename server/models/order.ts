import mongoose from "mongoose";
import { IOrder } from "../types/index.js";

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    saleDetails: {
        originalPrice: Number,
        salePrice: Number,
        discountAmount: Number,
        finalItemPrice: Number,
        saleName: String,
        discountType: { type: String, enum: ["FIRST_ORDER", "FESTIVAL_SALE"] },
        firstOrderDiscount: Number,
    },
    size: { type: String },
    color: { type: String },
})

const orderSchema = new mongoose.Schema<IOrder>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    shippingAddress: {
        villageHouseCode: { type: String, default: "" },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true, enum: ["cash", "razorpay"], default: "cash" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paymentIntentId: { type: String },
    razorpayOrderId: { type: String },
    orderStatus: { type: String, enum: ["placed", "processing", "shipped", "delivered", "cancelled"], default: "placed" },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    notes: String,
    deliveredAt: Date,
    estimatedDeliveryDate: Date,
    cancelledAt: Date,
    cancellationReason: String,
    refundId: String,
    refundAmount: Number,
    replacementRequest: {
        status: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
        reason: String,
        requestedAt: Date,
    },
}, { timestamps: true })

const Order = mongoose.model<IOrder>("Order", orderSchema)

export default Order