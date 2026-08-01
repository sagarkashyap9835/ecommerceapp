import { Request, Response, NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const adminEmail = process.env.ADMIN_EMAIL;
        const role = (adminEmail && email === adminEmail) ? "admin" : "user";

        user = await User.create({
          clerkId: userId,
          name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "User",
          email: email || `${userId}@clerk.user`,
          image: clerkUser.imageUrl,
          role: role,
        });
      } catch (e) {
        user = await User.create({
          clerkId: userId,
          name: "User",
          email: `${userId}@clerk.user`,
          role: "user",
        });
      }
    }

    if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    req.user = user;

    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "User role is not authorized to access this route",
      });
    }

    next();
  };
};