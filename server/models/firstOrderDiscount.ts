import mongoose from "mongoose";

const priceRuleSchema = new mongoose.Schema({
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    discountAmount: { type: Number, required: true },
});

const firstOrderDiscountSchema = new mongoose.Schema({
    isEnabled: { type: Boolean, default: false },
    title: { type: String, default: "Welcome Offer" },
    subtitle: { type: String, default: "Get discount on your first order" },
    priceRules: [priceRuleSchema]
}, { timestamps: true });

const FirstOrderDiscount = mongoose.model("FirstOrderDiscount", firstOrderDiscountSchema);
export default FirstOrderDiscount;
