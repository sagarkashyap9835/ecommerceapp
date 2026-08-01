import mongoose, { Schema } from "mongoose";
const cartItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
    size: {
        type: String,
        default: "",
    },
}, {
    _id: false,
});
const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
// Calculate Cart Total
cartSchema.methods.calculateTotal = function () {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
    return this.totalAmount;
};
const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
export default Cart;
