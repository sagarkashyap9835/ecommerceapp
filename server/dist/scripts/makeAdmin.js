import { clerkClient } from "@clerk/express";
import User from "../models/User.js";
const makeAdmin = async () => {
    try {
        const email = process.env.ADMIN_EMAIL;
        if (!email) {
            console.log("❌ ADMIN_EMAIL not set in .env");
            return;
        }
        let user = await User.findOne({ email });
        const client = clerkClient;
        if (!user) {
            console.log(`🔍 User ${email} not found in DB. Checking Clerk...`);
            const clerkUsers = await client.users.getUserList({
                emailAddress: [email],
            });
            if (!clerkUsers.data || clerkUsers.data.length === 0) {
                console.log("❌ Admin user not found in DB or Clerk");
                return;
            }
            const clerkUser = clerkUsers.data[0];
            console.log(`📥 Syncing admin user from Clerk to DB...`);
            user = await User.create({
                clerkId: clerkUser.id,
                name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "Admin",
                email: clerkUser.emailAddresses[0]?.emailAddress,
                image: clerkUser.imageUrl,
                role: "admin",
            });
        }
        else {
            user.role = "admin";
            await user.save();
        }
        await client.users.updateUserMetadata(user.clerkId, {
            publicMetadata: {
                role: "admin",
            },
        });
        console.log("✅ Admin promoted successfully in DB and Clerk");
    }
    catch (error) {
        console.error("❌ Admin promotion failed:", error.message);
    }
};
export default makeAdmin;
