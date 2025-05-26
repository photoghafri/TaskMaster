// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAkGE-lbEzcRVJZbKjE_SHJd38jENqut8k",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "project-management-f45cc.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "project-management-f45cc",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "project-management-f45cc.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1002222709659",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1002222709659:web:6b1ab479efcc4102824f3e",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-JYYNYZV8LP"
};

// Initialize Firebase only if we don't already have an instance
// This helps prevent multiple initializations during SSR/SSG
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Analytics only in browser environment and when supported
let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  // Only initialize analytics in the browser and in production
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((error) => {
    console.warn('Firebase Analytics not supported:', error);
  });
}

export { app, db, auth, storage, analytics };