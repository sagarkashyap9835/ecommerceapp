// import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
// import { getAuth } from 'firebase-admin/auth';
// import dotenv from 'dotenv';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Path to the service account JSON file
// const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

// let adminApp;
// const apps = getApps();

// if (apps.length === 0) {
//   if (fs.existsSync(serviceAccountPath)) {
//     const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
//     adminApp = initializeApp({
//       credential: cert(serviceAccount),
//       projectId: 'gramokart',
//     });
//     console.log('✅ Firebase Admin Initialized with Service Account');
//   } else {
//     console.warn('⚠️ firebase-service-account.json not found! Initializing without credentials.');
//     adminApp = initializeApp({
//       projectId: 'gramokart',
//     });
//   }
// } else {
//   adminApp = getApp();
// }

// export const adminAuth = getAuth(adminApp);


import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

console.log("Firebase env check:", {
  projectId: !!projectId,
  clientEmail: !!clientEmail,
  privateKey: !!privateKey,
  vercelEnv: process.env.VERCEL_ENV,
});

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Firebase Admin environment variables are missing");
}

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

export const adminAuth = getAuth(adminApp);