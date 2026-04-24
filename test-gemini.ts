import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  try {
    // There isn't a direct listModels in the JS SDK easily accessible this way, 
    // but we can try to initialize a standard one to see if the key works.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("Gemini 1.5 Flash test successful!");
  } catch (e: any) {
    console.error("API Error:", e.message);
  }
}

listModels();
