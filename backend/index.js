require('dotenv').config();
const express = require('express');
const cors = require('cors');

const verifyFirebaseToken = require('./authMiddleware'); // Import our robust auth middleware


const app = express();
const port = process.env.PORT || 3001; // Default to 3001 if PORT not in .env

app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit : '10mb' })); // Middleware to parse JSON request bodies increased limit to 10mb
app.use(express.urlencoded({ limit: '10mb', extended: true })); // urlencoded body parser with increased limit



// A simple health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'Backend is healthy and running!', timestamp: new Date().toISOString() });
});

// Protected route
app.get('/api/v1/secure-data', verifyFirebaseToken, (req, res) => {
  res.json({
    message: `Hello, ${req.user.name}!`,
    user: req.user
  });
});

// NEW: The main image processing endpoint
app.post('/api/v1/process', verifyFirebaseToken, (req, res) => {
  // Today, we are just building a stub to confirm we receive the image.
  // The 'image' property will contain the base64 string from the frontend.
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'No image data provided.' });
  }

  // SRE thinking: Log metadata, not the whole image!
  console.log(`Received image for user: ${req.user.uid}. Image size (base64 length): ${image.length}`);

  // In a future step, we'll send this 'image' to the Azure OCR service.
  // For now, just send a success response.
  res.status(200).json({
    message: 'Image received successfully. Processing will begin shortly.',
    // We can echo back some metadata
    imageSize: image.length,
    userId: req.user.uid,
  });
});


// Catch-all for undefined routes (optional, but good for seeing if something is wrong)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});