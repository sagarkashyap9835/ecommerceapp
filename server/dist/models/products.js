import mongoose, { Schema } from "mongoose";
const productSchema = new Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    sizes: [{ type: String }],
    category: {
        type: String,
        required: true,
        enum: ["Men", "Women", "Kids", "Shoes", "Bags", "Other"],
        default: "Other"
    },
    stock: { type: Number, required: true, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
// Text index for search functionality
productSchema.index({ name: "text", description: "text" });
// Completed model export
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
