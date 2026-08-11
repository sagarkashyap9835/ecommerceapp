import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types/index.js";

const reviewSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userImage: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    image: { type: String },
    isVerifiedPurchase: { type: Boolean, default: true },
}, { timestamps: true });

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    sizes: [{ type: String }],
    colors: [{ type: String }],
    category: { 
        type: String, 
        required: true,
        trim: true
    },
    subcategory: {
        type: String,
        trim: true
    },
    stock: { type: Number, required: true, default: 0, min: 0 },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    reviews: [reviewSchema],
    isFeatured: { type: Boolean, default: false },
    isBogo: { type: Boolean, default: false },
    isLatest: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Text index for search functionality
productSchema.index({ name: "text", description: "text" });

// Completed model export
const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;