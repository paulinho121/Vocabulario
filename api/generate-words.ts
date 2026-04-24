import { GoogleGenerativeAI } from '@google/generative-ai';

// Vercel Serverless Function
export default async function handler(req: any, res: any) {
  // Add CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { language, theme, learnedWordIds } = req.body;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    });

    const prompt = `
      You are a high-level language professor. Generate a JSON object for an INTERMEDIATE (B2 LEVEL) vocabulary session.
      Requirements:
      1. "words": 10 sophisticated vocabulary words for learning ${language} with the theme "${theme}". 
      2. "story": A cohesive story using all 10 words.
      Word Structure: { "id": "...", "word": "...", "translation": "...", "partOfSpeech": "...", "theme": "${theme}", "sentences": { "present": "...", "past": "...", "future": "..." } }
      Return ONLY raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);
    
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('API ERROR:', error.message);
    
    // Theme-aware Fallback
    const fallbacks: Record<string, any[]> = {
      travel: [{ word: 'Itinerary', translation: 'Itinerário' }, { word: 'Expedition', translation: 'Expedição' }],
      work: [{ word: 'Resilience', translation: 'Resiliência' }, { word: 'Prerequisite', translation: 'Pré-requisito' }],
      school: [{ word: 'Curriculum', translation: 'Currículo' }, { word: 'Erudition', translation: 'Erudição' }]
    };

    const selectedList = (fallbacks[theme as string] || fallbacks.work).slice(0, 10);
    
    return res.status(200).json({
      words: selectedList.map((item: any, idx: number) => ({
        id: `fallback_${idx}_${Date.now()}`,
        word: item.word,
        translation: item.translation,
        partOfSpeech: 'noun',
        theme: theme,
        sentences: {
          present: `This ${item.word} is very relevant.`,
          past: `We discussed the ${item.word} yesterday.`,
          future: `The ${item.word} will be improved.`
        }
      })),
      story: {
        text: "Success requires a combination of high-level skills and consistent effort.",
        translation: "O sucesso requer uma combinação de habilidades de alto nível e esforço consistente."
      }
    });
  }
}
