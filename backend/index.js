require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { extractTextFromImage } = require('./services/azureOcrService');
const verifyFirebaseToken = require('./authMiddleware'); // Import our robust auth middleware
const { cleanUpText } = require('./services/googleLlmService');
const { uploadFile, getSignedUrl } = require('./services/cloudStorageService');


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
  let rawOcrText = ''; // Initialize rawOcrText to store the OCR result

  if (!image) {
    return res.status(400).json({ error: 'No image data provided.' });
  }

  try {
    // Step 1 & 2: OCR and LLM (no changes here)
    const rawOcrText = await extractTextFromImage(image, req.user.uid);
    const cleanedText = await cleanUpText(rawOcrText, req.user.uid);

    // --- NEW LOGIC FOR DAY 6 ---

    // Step 3: Prepare the Markdown file for upload
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `journal-${timestamp}.md`;
    const destinationPath = `uploads/${req.user.uid}/${filename}`;
    const markdownBuffer = Buffer.from(cleanedText, 'utf-8');

    // Step 4: Upload the file to Cloud Storage
    await uploadFile(markdownBuffer, destinationPath, 'text/markdown');

    // Step 5: Get a secure, signed URL for the user to download the file
    const downloadUrl = await getSignedUrl(destinationPath);
    
    // Step 6: Send the URL back to the frontend
    res.status(200).json({
      message: 'Journal entry processed and saved successfully.',
      markdownUrl: downloadUrl,
    });

  } catch (error) {
    // This will now catch errors from any of our services
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