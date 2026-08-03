import mongoose, { Schema } from "mongoose";
const categorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    subcategories: [{ type: String, trim: true }],
    sizes: [{ type: String, trim: true }],
    icon: { type: String, default: "grid-outline" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
