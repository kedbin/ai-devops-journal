// backend/services/cloudStorageService.js

const admin = require('../firebaseAdmin'); // Use our existing admin setup

// Get a reference to the storage service
const bucket = admin.storage().bucket();

/**
 * Uploads a file buffer to Firebase Cloud Storage.
 * @param {Buffer} buffer The file content as a buffer.
 * @param {string} destinationPath The full path in the bucket (e.g., 'uploads/userId/file.md').
 * @param {string} contentType The MIME type of the file (e.g., 'text/markdown').
 * @returns {Promise<void>}
 */
async function uploadFile(buffer, destinationPath, contentType) {
  const file = bucket.file(destinationPath);
  
  // SRE: Structured logging for a critical infrastructure operation
  console.log(JSON.stringify({
      level: 'INFO',
      message: 'Uploading file to Cloud Storage',
      destinationPath: destinationPath,
      sizeBytes: buffer.length,
      timestamp: new Date().toISOString()
  }));

  try {
    await file.save(buffer, {
      metadata: {
        contentType: contentType,
      },
    });
    console.log(JSON.stringify({
        level: 'INFO',
        message: 'File uploaded successfully',
        destinationPath: destinationPath,
        timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error(JSON.stringify({
        level: 'ERROR',
        message: 'Failed to upload file to Cloud Storage',
        destinationPath: destinationPath,
        errorMessage: error.message,
        timestamp: new Date().toISOString()
    }));
    throw new Error('Failed to save the final document.');
  }
}

/**
 * Generates a secure, time-limited signed URL for a file.
 * @param {string} filePath The full path to the file in the bucket.
 * @returns {Promise<string>} The signed URL.
 */
async function getSignedUrl(filePath) {
  // These options will make the URL expire in 15 minutes.
  const options = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  try {
    const [url] = await bucket.file(filePath).getSignedUrl(options);
    return url;
  } catch (error) {
    console.error(JSON.stringify({
        level: 'ERROR',
        message: 'Failed to generate signed URL',
        filePath: filePath,
        errorMessage: error.message,
        timestamp: new Date().toISOString()
    }));
    throw new Error('Failed to create a secure link for the document.');
  }
}

module.exports = { uploadFile, getSignedUrl };