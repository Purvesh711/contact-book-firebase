// Firebase SDK imports
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAi0aJmwS9c7jfHkIaXg-RpgWqXkU9PUO8",
  authDomain: "contact-book-app-f669e.firebaseapp.com",
  projectId: "contact-book-app-f669e",
  storageBucket: "contact-book-app-f669e.firebasestorage.app",
  messagingSenderId: "1074801593086",
  appId: "1:1074801593086:web:f1255a3041c77b86da73af",
  measurementId: "G-1H7X64D0DY"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services we will use
export const auth = getAuth(app);       // For Login / Register
export const db = getFirestore(app);    // For Firestore CRUD operations
