import mongoose from "mongoose";

const priceRuleSchema = new mongoose.Schema({
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    discountAmount: { type: Number, required: true },
});

const saleSchema = new mongoose.Schema({
    name: { type: String, required: true },          // e.g., "Diwali Sale"
    subtitle: { type: String },                       // e.g., "Special Diwali Discounts"
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    status: { type: String, enum: ["ACTIVE", "SCHEDULED", "EXPIRED"], default: "SCHEDULED" },
    priceRules: [priceRuleSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;
