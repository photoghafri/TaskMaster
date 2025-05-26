// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAkGE-lbEzcRVJZbKjE_SHJd38jENqut8k",
  authDomain: "project-management-f45cc.firebaseapp.com",
  projectId: "project-management-f45cc",
  storageBucket: "project-management-f45cc.firebasestorage.app",
  messagingSenderId: "1002222709659",
  appId: "1:1002222709659:web:6b1ab479efcc4102824f3e",
  measurementId: "G-JYYNYZV8LP"
};

// Initialize Firebase only if we don't already have an instance
// This helps prevent multiple initializations during SSR/SSG
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Analytics is now null by default
const analytics = null;

export { app, db, auth, storage, analytics }; 