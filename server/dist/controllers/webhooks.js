import { verifyWebhook } from "@clerk/express/webhooks";
import User from "../models/User.js";
export const clerkWebhook = async (req, res) => {
    console.log("🔥 Clerk Webhook Hit");
    try {
        const evt = await verifyWebhook(req);
        console.log("📌 Event Type:", evt.type);
        const { id } = evt.data;
        switch (evt.type) {
            case "user.created": {
                const userData = {
                    clerkId: id,
                    name: `${evt.data.first_name ?? ""} ${evt.data.last_name ?? ""}`.trim(),
                    email: evt.data.email_addresses[0]?.email_address,
                    image: evt.data.image_url,
                    role: "user",
                };
                console.log("📥 Creating User:", userData);
                const user = await User.create(userData);
                console.log("✅ User Saved Successfully:", user);
                break;
            }
            case "user.updated": {
                const user = await User.findOneAndUpdate({ clerkId: id }, {
                    name: `${evt.data.first_name ?? ""} ${evt.data.last_name ?? ""}`.trim(),
                    email: evt.data.email_addresses[0]?.email_address,
                    image: evt.data.image_url,
                }, { new: true });
                console.log("✏️ User Updated:", user);
                break;
            }
            case "user.deleted": {
                const user = await User.findOneAndDelete({
                    clerkId: id,
                });
                console.log("🗑️ User Deleted:", user);
                break;
            }
            default:
                console.log("⚠️ Unhandled Event:", evt.type);
        }
        return res.status(200).json({
            success: true,
            message: "Webhook processed successfully",
        });
    }
    catch (err) {
        console.error("❌ Webhook Error:", err);
        return res.status(400).json({
            success: false,
            message: "Webhook verification failed",
        });
    }
};
