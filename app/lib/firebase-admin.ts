import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminApp: App;

// Initialize Firebase Admin SDK (server-side only)
export function getAdminApp() {
  if (getApps().length === 0) {
    // Initialize with service account credentials
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    adminApp = getApps()[0];
  }
  return adminApp;
}

export const adminAuth = () => getAuth(getAdminApp());

// Verify Firebase ID token and return decoded token
export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw new Error("Invalid or expired token");
  }
}
