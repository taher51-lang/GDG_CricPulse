import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// In production, these variables are injected via Vercel Environment Variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL, // Essential for Realtime DB
};

// Ensure we don't re-initialize the app during hot reloads in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize App Check for Security (Only in Production client-side)
if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "dummy-recaptcha-key"),
    isTokenAutoRefreshEnabled: true
  });
}

// Initialize services
// The Realtime DB handles our sub-second Over Pulse predictions stream
export const realtimeDb = getDatabase(app); 

// Firestore handles our contextual flash-merch and user records
export const firestore = getFirestore(app);

export default app;
