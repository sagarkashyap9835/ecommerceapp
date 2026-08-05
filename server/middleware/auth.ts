import { Request, Response, NextFunction } from "express";
import { adminAuth } from "../config/firebaseAdmin.js";
import User from "../models/User.js";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error: any) {
      console.error("Token verification failed:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
        error: error.message,
      });
    }

    const userId = decodedToken.uid;
    const email = decodedToken.email;

    let user = await User.findOne({ firebaseUid: userId });

    if (!user && email) {
      // Try to find by email (for users migrated from Clerk)
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        // Link the existing account to the new Firebase UID
        user.firebaseUid = userId;
        await user.save();
      }
    }

    if (!user) {
      // Create user if not exists (fallback)
      const adminEmail = process.env.ADMIN_EMAIL;
      const role = (adminEmail && email === adminEmail) ? "admin" : "user";

      user = await User.create({
        firebaseUid: userId,
        name: decodedToken.name || "User",
        email: email || `${userId}@firebase.user`,
        image: decodedToken.picture || "",
        role: role,
      });
    }

    if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    req.user = user;

    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || "Authentication failed",
      error: error.message || String(error),
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