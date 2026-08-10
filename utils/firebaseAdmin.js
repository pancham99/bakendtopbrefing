const { initializeApp, getApps, getApp, cert } = require('firebase-admin/app');
const { getMessaging: getAdminMessaging } = require('firebase-admin/messaging');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let firebaseApp = null;

const createCert = (certObj) => {
  if (typeof cert === 'function') {
    return cert(certObj);
  }
  if (admin.credential && typeof admin.credential.cert === 'function') {
    return admin.credential.cert(certObj);
  }
  return certObj;
};

const getFirebaseApp = () => {
  if (firebaseApp) return firebaseApp;

  try {
    const existingApps = getApps();
    if (existingApps && existingApps.length > 0) {
      firebaseApp = getApp();
      return firebaseApp;
    }

    let credential = null;

    // 1. Try service account file if present in backend root
    const keyFilePath = path.join(__dirname, '..', 'firebase-service-account.json');
    if (fs.existsSync(keyFilePath)) {
      try {
        const serviceAccount = require(keyFilePath);
        credential = createCert(serviceAccount);
      } catch (err) {
        console.warn('[FirebaseAdmin] Failed to load firebase-service-account.json:', err.message);
      }
    }

    // 2. Try individual environment variables
    if (!credential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      credential = createCert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      });
    }

    // 3. Try Environment Variable JSON string if present
    if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT.startsWith('{')) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        credential = createCert(serviceAccount);
      } catch (err) {
        console.warn('[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', err.message);
      }
    }

    if (credential) {
      firebaseApp = initializeApp({
        credential: credential
      });
      console.log('✅ Firebase Admin SDK initialized successfully');
    } else {
      console.warn('⚠️ Firebase Admin SDK credentials not configured in environment or firebase-service-account.json. FCM notifications will be skipped until configured.');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  }

  return firebaseApp;
};

// Attempt eager initialization
getFirebaseApp();

const getMessaging = () => {
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    return getAdminMessaging(app);
  } catch (error) {
    console.error('❌ Error obtaining Firebase Messaging instance:', error.message);
    return null;
  }
};

module.exports = {
  admin,
  get firebaseApp() {
    return getFirebaseApp();
  },
  getFirebaseApp,
  getMessaging
};

