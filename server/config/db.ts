// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI as string);

//     // Clean up old obsolete indexes from Clerk integration if they exist
//     try {
//       await mongoose.connection.collection('users').dropIndex('clerkId_1');
//       console.log("🧹 Dropped obsolete clerkId_1 index from users collection");
//     } catch (e) {
//       // Ignore if index doesn't exist
//     }

//     console.log("✅ MongoDB Connected");
//   } catch (error) {
//     console.error("❌ MongoDB Connection Error:", error);
//     process.exit(1);
//   }
// };

// export default connectDB;

import mongoose from "mongoose";
import dns from "node:dns";

// Fix MongoDB Atlas DNS/SRV resolution issue
dns.setServers([
  "8.8.8.8",      // Google DNS
  "1.1.1.1",      // Cloudflare DNS
]);

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;

