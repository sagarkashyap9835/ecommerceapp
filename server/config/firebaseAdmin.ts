import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';
dotenv.config();

const apps = getApps();
const adminApp = apps.length === 0 ? initializeApp({
  projectId: 'gramokart',
}) : getApp();

export const adminAuth = getAuth(adminApp);
