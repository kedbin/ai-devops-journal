const admin = require('firebase-admin');

// --- The configuration object that now includes the storageBucket ---
const appConfig = {
  // Use the service account file for credentials. The SDK is smart
  // enough to find this via the GOOGLE_APPLICATION_CREDENTIALS env var.
  credential: admin.credential.applicationDefault(),

  // --- THIS IS THE FIX ---
  // Explicitly provide the storage bucket URL from our .env file.
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
};

try {
  // The SDK will automatically look for the GOOGLE_APPLICATION_CREDENTIALS
  // environment variable and use the file path from there.
  // This is the preferred way for local and some cloud environments.
  admin.initializeApp(appConfig);
  console.log('Firebase Admin SDK initialized successfully with Storage.');
} catch (error) {
  console.error('Firebase Admin initialization failed.', error);
  // Fail fast if we can't initialize the core services.
  process.exit(1);
}

module.exports = admin;