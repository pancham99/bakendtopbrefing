require("dotenv").config();
const path = require("path");
const fs = require("fs");
const { initializeApp, getApps, getApp, cert } = require("firebase-admin/app");
const { getMessaging: getAdminMessaging } = require("firebase-admin/messaging");

let firebaseApp = null;

const getFirebaseApp = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const existingApps = getApps();
    if (existingApps && existingApps.length > 0) {
      firebaseApp = getApp();
      return firebaseApp;
    }

    let credential = null;

    // Strategy 1: Check firebase-service-account.json file in root backend folder
    const keyFilePath = path.join(__dirname, "..", "firebase-service-account.json");
    if (fs.existsSync(keyFilePath)) {
      try {
        const serviceAccount = require(keyFilePath);
        credential = cert(serviceAccount);
        console.log("✅ Loaded Firebase credentials from firebase-service-account.json");
      } catch (err) {
        console.warn("⚠️ Failed to load firebase-service-account.json:", err.message);
      }
    }

    // Strategy 2: Check FIREBASE_SERVICE_ACCOUNT env var (JSON string)
    if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT.trim().startsWith("{")) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        credential = cert(serviceAccount);
        console.log("✅ Loaded Firebase credentials from FIREBASE_SERVICE_ACCOUNT env variable");
      } catch (err) {
        console.warn("⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT env variable:", err.message);
      }
    }

    // Strategy 3: Check individual environment variables
    if (!credential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      });
      console.log("✅ Loaded Firebase credentials from individual environment variables");
    }

    if (credential) {
      firebaseApp = initializeApp({ credential });
      console.log("✅ Firebase Admin SDK initialized successfully");
    } else {
      console.warn("⚠️ Firebase credentials missing. Place firebase-service-account.json in backend root or set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env");
    }

    return firebaseApp;
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error.message);
    return null;
  }
};

const getFirebaseMessaging = () => {
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  try {
    return getAdminMessaging(app);
  } catch (error) {
    console.error("❌ Firebase Messaging error:", error.message);
    return null;
  }
};

// Attempt eager initialization
getFirebaseApp();

module.exports = {
  getFirebaseApp,
  getMessaging: getFirebaseMessaging,
};




