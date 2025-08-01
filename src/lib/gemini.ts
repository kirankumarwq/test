import { GoogleGenerativeAI } from '@google/generative-ai';

// It's crucial to secure your API key. Do not expose it on the client side.
// Ensure GEMINI_API_KEY is set in your .env.local file.
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Example of a more specific function you could build here
export async function getSpecialtiesFromSymptoms(symptoms: string): Promise<string[]> {
  const prompt = `Based on the following symptoms, recommend up to 3 relevant medical specialties. Respond ONLY with a valid JSON array of strings, like ["Cardiologist", "Neurologist"]. Symptoms: "${symptoms}"`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the text to ensure it's valid JSON
    const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Basic validation before parsing
    if (jsonText.startsWith('[') && jsonText.endsWith(']')) {
      return JSON.parse(jsonText);
    } else {
      console.error("Gemini did not return a valid JSON array:", text);
      // Fallback or error handling - maybe return a default specialty
      return ["General Practitioner"];
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get recommendations from AI model.");
  }
}
