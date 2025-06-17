// backend/services/googleLlmService.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Google Gemini API key is not configured.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function extractJsonFromLlmResponse(rawResponse) {
  const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
  const potentialJson = jsonMatch ? jsonMatch[1] : rawResponse;
  try {
    return JSON.parse(potentialJson);
  } catch (error) {
    console.error(JSON.stringify({
        level: 'ERROR',
        message: 'Failed to parse JSON from LLM response',
        rawResponse: rawResponse,
        timestamp: new Date().toISOString()
    }));
    return null;
  }
}

// --- The NEW "One-Shot" Function ---
async function processJournalEntry(rawOcrText, userId) {
  console.log(JSON.stringify({
    level: 'INFO',
    message: 'Starting combined AI processing for user',
    userId: userId,
    timestamp: new Date().toISOString()
  }));

  if (!rawOcrText || rawOcrText.trim() === '') {
    // Return a default structure if there's no input
    return {
        cleanedText: '',
        title: 'Untitled Entry',
        date: new Date().toISOString().split('T')[0],
        tags: ['journal']
    };
  }

  // --- NEW, All-in-One Prompt ---
  const prompt = `You are an intelligent journaling assistant. Your task is to process raw OCR text from a handwritten journal and return a single, valid JSON object.

The JSON object must have exactly four keys:
1. "cleanedText": The OCR text, corrected for spelling, grammar, and punctuation. Retain the original tone and preserve meaningful line breaks.
2. "title": A concise, engaging title for this journal entry, no more than 10 words.
3. "date": Try to find a date written in the journal entry text. If you find one, format it as "YYYY-MM-DD". If you cannot find any date in the text, return an empty string ("").
4. "tags": An array of 3 to 5 relevant, lowercase, single-word strings that categorize the entry.

Do not include any text, explanation, or markdown formatting outside of the main JSON object.

Raw OCR Text:
---
${rawOcrText}
---
`;

  const startTime = Date.now();

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const llmResponseText = response.text();
    const duration = Date.now() - startTime;

    const structuredData = extractJsonFromLlmResponse(llmResponseText);

    if (!structuredData || !structuredData.cleanedText || !structuredData.title || !structuredData.tags) {
      throw new Error('LLM failed to return a valid and complete JSON object.');
    }

    console.log(JSON.stringify({
        level: 'INFO',
        message: 'Combined AI processing successful',
        userId: userId,
        durationMs: duration,
        generatedTitle: structuredData.title,
        timestamp: new Date().toISOString()
    }));
    
    // Return the entire structured object
    return structuredData;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(JSON.stringify({
        level: 'ERROR',
        message: 'Google Gemini API call for combined processing failed',
        userId: userId,
        durationMs: duration,
        errorMessage: error.message,
        timestamp: new Date().toISOString()
    }));
    
    // As a fallback, we can't generate metadata, but we can still return the raw text.
    // This maintains some level of resiliency.
    return {
        cleanedText: rawOcrText, // Fallback to raw text
        title: 'Processing Error - Untitled',
        date: new Date().toISOString().split('T')[0],
        tags: ['error']
    };
  }
}

// Export only the new, powerful function
module.exports = { processJournalEntry }; 