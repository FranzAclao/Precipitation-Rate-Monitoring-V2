import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCzhyQ2pux9yH5pJU7d8wWVFldaDebg80E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lte-test2.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://lte-test2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lte-test2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lte-test2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1022084379917",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1022084379917:web:f04f9a1c6ceef6bb07ac44",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-F8YHCZXZ7D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
