
const admin = require('./firebaseAdmin'); // Use our robust setup

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: No token provided or malformed header.');
  }

  // This is the line that extracts the token string from the header
  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach user info to the request object
    next(); // Token is valid, proceed to the next middleware/route handler
  } catch (error) {
    // Be more specific in error logging
    console.error(`Token verification failed for user ID token.`, error);
    res.status(403).json({ error: 'Forbidden', detail: 'Invalid ID token.', code: error.code });
  }
}

module.exports = verifyFirebaseToken;