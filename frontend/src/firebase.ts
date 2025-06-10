// frontend/src/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import type { User } from "firebase/auth";

// Your web app's Firebase configuration.
// This uses environment variables that you will set in your .env file.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the auth service and the Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// A helper function to trigger the Google Sign-In popup
export const signInWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

// We can also export the User type for convenience in our components
export type { User };