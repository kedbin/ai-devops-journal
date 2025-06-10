const admin = require('firebase-admin');

try {
  // The SDK will automatically look for the GOOGLE_APPLICATION_CREDENTIALS
  // environment variable and use the file path from there.
  // This is the preferred way for local and some cloud environments.
  admin.initializeApp();
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  // This is a more robust way to handle initialization in production environments
  // where you might set individual env vars instead of a file.
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized successfully from environment variables.');
  } else {
    console.error('Firebase Admin initialization failed. Ensure GOOGLE_APPLICATION_CREDENTIALS or individual Firebase Admin environment variables are set.', error);
    process.exit(1); // Exit the process if we can't connect to Firebase Admin
  }
}

module.exports = admin;