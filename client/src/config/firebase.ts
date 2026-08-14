// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNJ52_U-mqdkpxthbR0ZsJBCTAAS2JSUk",
  authDomain: "gramokart.firebaseapp.com",
  projectId: "gramokart",
  storageBucket: "gramokart.firebasestorage.app",
  messagingSenderId: "225141346573",
  appId: "1:225141346573:web:9be319311605663adf6044",
  measurementId: "G-Z7K8PTLFCH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseAuth = require('firebase/auth');
const reactNativePersistence = firebaseAuth?.getReactNativePersistence;

const auth = initializeAuth(app, {
  persistence:
    Platform.OS === 'web'
      ? browserLocalPersistence
      : reactNativePersistence
        ? reactNativePersistence(AsyncStorage)
        : browserLocalPersistence,
});

// Analytics (only supported in web/some platforms, may throw on React Native without specific native modules)

let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(() => {});

export { app, auth, analytics };