import { verifyWebhook } from "@clerk/express/webhooks";
import { Request, Response } from "express";
import User from "../models/User.js";

export const clerkWebhook = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;

    switch (evt.type) {
      case "user.created":
        await User.create({
          clerkId: id,
          name: `${evt.data.first_name ?? ""} ${evt.data.last_name ?? ""}`.trim(),
          email: evt.data.email_addresses[0]?.email_address,
          image: evt.data.image_url,
          role: "user",
        });
        break;

      case "user.updated":
        await User.findOneAndUpdate(
          { clerkId: id },
          {
            name: `${evt.data.first_name ?? ""} ${evt.data.last_name ?? ""}`.trim(),
            email: evt.data.email_addresses[0]?.email_address,
            image: evt.data.image_url,
          }
        );
        break;

      case "user.deleted":
        await User.findOneAndDelete({
          clerkId: id,
        });
        break;

      default:
        console.log(`Unhandled event: ${evt.type}`);
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).json({
      success: false,
      message: "Webhook verification failed",
    });
  }
};