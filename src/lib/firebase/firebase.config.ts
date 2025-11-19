
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}; 

// Diagnostic log to check the status of environment variables in all environments
const configStatus = {
  apiKey: firebaseConfig.apiKey ? 'API_KEY_IS_PRESENT' : 'API_KEY_IS_MISSING_OR_EMPTY',
  projectId: firebaseConfig.projectId,
  mode: import.meta.env.MODE,
};
console.log("Firebase Config Status:", configStatus);


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Connect to emulators ONLY when running in development and on localhost
if (import.meta.env.DEV && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  try {
    console.log("Connecting to Firebase emulators...");
    connectFirestoreEmulator(db, "localhost", 8080);
    connectAuthEmulator(auth, "http://localhost:9099");
    connectStorageEmulator(storage, "localhost", 9199);
  } catch (error) {
    console.error("Error connecting to Firebase emulators:", error);
  }
}

export { app, db, auth, storage };
