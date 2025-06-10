require('dotenv').config();
const express = require('express');
const cors = require('cors');

const verifyFirebaseToken = require('./authMiddleware'); // Import our robust auth middleware


const app = express();
const port = process.env.PORT || 3001; // Default to 3001 if PORT not in .env

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON request bodies


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

// Catch-all for undefined routes (optional, but good for seeing if something is wrong)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});