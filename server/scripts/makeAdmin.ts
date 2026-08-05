import { adminAuth } from "../config/firebaseAdmin.js";
import User from "../models/User.js";

const makeAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    if (!email) {
      console.log("❌ ADMIN_EMAIL not set in .env");
      return;
    }

    let user = await User.findOne({ email });
    let firebaseUser;

    try {
      firebaseUser = await adminAuth.getUserByEmail(email);
    } catch (err: any) {
      console.log(`❌ Admin user ${email} not found in Firebase Auth`);
      return;
    }

    if (!user) {
      console.log(`🔍 User ${email} not found in DB. Creating from Firebase...`);
      console.log(`📥 Syncing admin user from Firebase to DB...`);
      user = await User.create({
        firebaseUid: firebaseUser.uid,
        name: firebaseUser.displayName || "Admin",
        email: firebaseUser.email,
        image: firebaseUser.photoURL || "",
        role: "admin",
      });
    } else {
      user.role = "admin";
      // Update firebaseUid for old users who might not have it set properly
      user.firebaseUid = firebaseUser.uid;
      await user.save();
    }

    // Set custom claims in Firebase Auth for admin
    try {
      if (user && user.firebaseUid) {
        await adminAuth.setCustomUserClaims(user.firebaseUid, { role: 'admin' });
      }
    } catch (err: any) {
      console.log("⚠️ Could not set custom claims in Firebase Auth. Ensure Firebase Admin is fully configured with credentials.");
    }

    console.log("✅ Admin promoted successfully in DB");
  } catch (error: any) {
    console.error("❌ Admin promotion failed:", error.message);
  }
};

export default makeAdmin;