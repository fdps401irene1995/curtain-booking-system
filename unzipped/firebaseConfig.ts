// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your Firebase configuration.
// Using environment variables for sensitive data like API keys is a security best practice.
const firebaseConfig = {
  apiKey: process.env.API_KEY, // CRITICAL: Use environment variable as per guidelines.
  authDomain: "smile-36340.firebaseapp.com",
  projectId: "smile-36340",
  storageBucket: "smile-36340.appspot.com",
  messagingSenderId: "413621245639",
  appId: "1:413621245639:web:93d4612c6f174b467150e2",
  measurementId: "G-YXZ3L14JGV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);