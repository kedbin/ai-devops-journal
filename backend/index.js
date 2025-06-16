require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { extractTextFromImage } = require('./services/azureOcrService');
const verifyFirebaseToken = require('./authMiddleware'); // Import our robust auth middleware
const { processJournalEntry } = require('./services/googleLlmService');
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

  if (!image) {
    return res.status(400).json({ error: 'No image data provided.' });
  }

  try {
    // Step 1: Extract raw text from image (no change)
    const rawOcrText = await extractTextFromImage(image, req.user.uid);

    // Step 2: Call the "one-shot" AI processor to get everything
    const aiResult = await processJournalEntry(rawOcrText, req.user.uid);

    // Step 3: Construct the HUGO-ready Markdown file from the structured data
    const frontMatter = `---
title: "${aiResult.title.replace(/"/g, '\\"')}"
date: "${aiResult.date}"
tags: [${aiResult.tags.map(tag => `"${tag}"`).join(', ')}]
draft: true
---`;

    const fullPostContent = frontMatter + '\n\n' + aiResult.cleanedText;

    // Step 4: Prepare the file for upload (no change)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `journal-${timestamp}.md`;
    const destinationPath = `uploads/${req.user.uid}/${filename}`;
    const markdownBuffer = Buffer.from(fullPostContent, 'utf-8');

    // Step 5: Upload the file to Cloud Storage (no change)
    await uploadFile(markdownBuffer, destinationPath, 'text/markdown');

    // Step 6: Get a secure, signed URL (no change)
    const downloadUrl = await getSignedUrl(destinationPath);

    // Step 7: Send the URL and the full content for preview back to the frontend
    res.status(200).json({
      message: 'Journal entry processed, formatted, and saved successfully.',
      downloadUrl: downloadUrl,
      hugoContent: fullPostContent, // Send this for the immediate preview
    });

  } catch (error) {
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