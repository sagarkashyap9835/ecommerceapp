import { clerkClient } from "@clerk/express";
import User from "../models/User.js";
const makeAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;
        const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
        if (!user) {
            console.log("❌ Admin user not found");
            return;
        }
        const client = clerkClient;
        await client.users.updateUserMetadata(user.clerkId, {
            publicMetadata: {
                role: "admin",
            },
        });
        console.log("✅ Admin promoted successfully");
    }
    catch (error) {
        console.error("❌ Admin promotion failed:", error.message);
    }
};
export default makeAdmin;
