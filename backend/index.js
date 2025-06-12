require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { extractTextFromImage } = require('./services/azureOcrService');
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

// The main image processing endpoint
app.post('/api/v1/process', verifyFirebaseToken, async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'No image data provided.' });
  }

  try {
    // Call our new, isolated service function
    const extractedText = await extractTextFromImage(image, req.user.uid);

    // Send the successful result back to the frontend
    res.status(200).json({
      message: 'Image processed successfully.',
      ocrResult: extractedText,
    });
  } catch (error) {
    // Our service threw a user-friendly error, so we can send it
    // The detailed error was already logged by the service itself
    res.status(500).json({ error: error.message });
  }
});

// Catch-all for undefined routes (optional, but good for seeing if something is wrong)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});