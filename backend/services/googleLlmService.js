// backend/services/googleLlmService.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- SRE: Secure Configuration & Fail Fast ---
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Google Gemini API key is not configured in environment variables.");
}

// Initialize the clients
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20"}); // Use the fast and capable model

// --- SRE: Defensive, Observable Function ---
async function cleanUpText(rawText, userId) {
  // SRE: Structured Logging - log the entry point
  console.log(JSON.stringify({
    level: 'INFO',
    message: 'Starting LLM cleanup process for user',
    userId: userId,
    timestamp: new Date().toISOString()
  }));

  // SRE: Defensive Gate - Don't call the LLM if there's no text to process.
  if (!rawText || rawText.trim() === '' || rawText.trim() === 'No text found in the image.') {
    console.log(JSON.stringify({
        level: 'WARN',
        message: 'Skipping LLM cleanup due to empty or invalid input text.',
        userId: userId,
        timestamp: new Date().toISOString()
      }));
    return rawText; // Return the original (empty) text
  }

  // --- Prompt Engineering ---
  // The prompt is the most critical part. It gives the LLM clear instructions.
  const prompt = `You are a helpful assistant that cleans up raw text transcribed from a person's handwritten journal.
  Your task is to:
  1. Correct spelling and grammatical errors.
  2. Fix punctuation and capitalization.
  3. Retain the original meaning and context of the text. However make it more readable and coherent.
  4. Preserve line breaks where they seem intentional for separating thoughts or paragraphs.

  Here is the raw text:
  ---
  ${rawText}
  ---
  Return only the cleaned up text.`;

  const startTime = Date.now(); // SRE: Start timer

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const cleanedText = response.text();
    
    const duration = Date.now() - startTime; // SRE: Calculate duration

    // SRE: Log successful operation with performance metric
    console.log(JSON.stringify({
      level: 'INFO',
      message: 'LLM cleanup successful',
      userId: userId,
      durationMs: duration,
      originalLength: rawText.length,
      cleanedLength: cleanedText.length,
      timestamp: new Date().toISOString()
    }));
    
    return cleanedText;

  } catch (error) {
    const duration = Date.now() - startTime; // SRE: Calculate duration on failure

    // SRE: Log failure with context
    console.error(JSON.stringify({
      level: 'ERROR',
      message: 'Google Gemini API call failed',
      userId: userId,
      durationMs: duration,
      errorMessage: error.message,
      timestamp: new Date().toISOString()
    }));

    // SRE: Don't fail the whole request. Fallback to the raw OCR text.
    // This is a resiliency pattern. It's better to give the user uncleaned text
    // than to give them a total failure because the LLM was down.
    console.warn(JSON.stringify({
        level: 'WARN',
        message: 'Falling back to raw OCR text due to LLM error.',
        userId: userId,
        timestamp: new Date().toISOString()
    }));
    return rawText; // Fallback to returning the original text
  }
}

module.exports = { cleanUpText };