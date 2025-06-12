// backend/services/azureOcrService.js

// --- Corrected for @azure-rest/ai-vision-image-analysis package ---
const ImageAnalysisClient = require('@azure-rest/ai-vision-image-analysis').default;
const { AzureKeyCredential } = require('@azure/core-auth');

// Get credentials from environment variables.
const endpoint = process.env.AZURE_VISION_ENDPOINT;
const key = process.env.AZURE_VISION_KEY;

if (!endpoint || !key) {
  throw new Error("Azure AI Vision credentials are not configured in environment variables.");
}

// Create an authenticated client using the correct package
const client = ImageAnalysisClient(endpoint, new AzureKeyCredential(key));

async function extractTextFromImage(base64Image, userId) {
  console.log(JSON.stringify({
    level: 'INFO',
    message: 'Starting OCR process for user',
    userId: userId,
    timestamp: new Date().toISOString()
  }));

  const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

  const startTime = Date.now();

  try {
    // --- THE KEY CHANGE IS HERE ---
    // The new SDK uses a different method signature.
    // We call 'path' to specify the API endpoint and then 'post' to send the data.
    const result = await client.path('/imageanalysis:analyze').post({
      // The body now contains the image data directly
      body: buffer,
      // Query parameters specify the features we want
      queryParameters: {
        features: 'read', // 'read' is the new name for OCR
        'language': 'en', // Specify the language if needed
      },
      // We must specify the content type for binary data
      contentType: 'application/octet-stream'
    });

    const duration = Date.now() - startTime;
    
    // The new SDK has a different response structure. We check the status code.
    if (result.status !== '200') {
      // The body of the error response contains the details
      const errorBody = result.body;
      throw new Error(`Azure API Error: ${errorBody.error.code} - ${errorBody.error.message}`);
    }

    const ocrResult = result.body; // The successful response body is the result

    if (ocrResult.readResult && ocrResult.readResult.blocks.length > 0) {
      const extractedText = ocrResult.readResult.blocks.map(block => block.lines.map(line => line.text).join('\n')).join('\n\n');
      
      console.log(JSON.stringify({
        level: 'INFO',
        message: 'OCR process successful',
        userId: userId,
        durationMs: duration,
        extractedTextLength: extractedText.length,
        timestamp: new Date().toISOString()
      }));
      
      return extractedText;
    } else {
      console.log(JSON.stringify({
        level: 'WARN',
        message: 'OCR process completed but no text was found',
        userId: userId,
        durationMs: duration,
        timestamp: new Date().toISOString()
      }));
      return "No text found in the image.";
    }
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error(JSON.stringify({
      level: 'ERROR',
      message: 'Azure AI Vision API call failed',
      userId: userId,
      durationMs: duration,
      errorMessage: error.message, // The error message is now more descriptive
      timestamp: new Date().toISOString()
    }));

    throw new Error("Failed to analyze the image due to an external service error.");
  }
}

module.exports = { extractTextFromImage };