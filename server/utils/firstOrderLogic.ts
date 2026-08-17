import FirstOrderDiscount from "../models/firstOrderDiscount.js";
import User from "../models/User.js";
import Order from "../models/order.js";

export const getFirstOrderSettings = async () => {
    let settings = await FirstOrderDiscount.findOne();
    if (!settings) {
        settings = await FirstOrderDiscount.create({});
    }
    return settings;
};

export const checkFirstOrderEligibility = async (userId: string) => {
    if (!userId) return false;

    const user = await User.findById(userId);
    if (!user) return false;

    // Check frontend flag
    if (user.hasCompletedFirstOrder) return false;

    // Check backend source of truth
    // A successful order is an order that is placed and either paid or pending cash on delivery
    const pastOrder = await Order.findOne({
        user: userId,
        orderStatus: { $nin: ["cancelled"] },
        // if user has any non cancelled order, means they placed it successfully
    });

    if (pastOrder) {
        // Double check updates user flag
        user.hasCompletedFirstOrder = true;
        await user.save();
        return false;
    }

    return true;
};
