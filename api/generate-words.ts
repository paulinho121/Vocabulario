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
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Missing API Key', 
      message: 'GEMINI_API_KEY is not configured in Vercel environment variables.' 
    });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

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
      2. "story": A cohesive story using ALL 10 words.
      Word Structure: { "id": "...", "word": "...", "translation": "...", "partOfSpeech": "...", "theme": "${theme}", "sentences": { "present": "...", "past": "...", "future": "..." } }
      Return ONLY raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);
    
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('API ERROR:', error.message);
    
    // Theme-aware Fallback (expanded to 10 words)
    const fallbacks: Record<string, any[]> = {
      travel: [
        { word: 'Itinerary', translation: 'Itinerário' }, { word: 'Expedition', translation: 'Expedição' },
        { word: 'Destination', translation: 'Destino' }, { word: 'Sightseeing', translation: 'Turismo' },
        { word: 'Accommodation', translation: 'Acomodação' }, { word: 'Adventure', translation: 'Aventura' },
        { word: 'Journey', translation: 'Jornada' }, { word: 'Passport', translation: 'Passaporte' },
        { word: 'Landscape', translation: 'Paisagem' }, { word: 'Baggage', translation: 'Bagagem' }
      ],
      work: [
        { word: 'Resilience', translation: 'Resiliência' }, { word: 'Prerequisite', translation: 'Pré-requisito' },
        { word: 'Collaborate', translation: 'Colaborar' }, { word: 'Efficiency', translation: 'Eficiência' },
        { word: 'Networking', translation: 'Networking' }, { word: 'Leadership', translation: 'Liderança' },
        { word: 'Deadline', translation: 'Prazo' }, { word: 'Productivity', translation: 'Produtividade' },
        { word: 'Innovation', translation: 'Inovação' }, { word: 'Strategy', translation: 'Estratégia' }
      ],
      school: [
        { word: 'Curriculum', translation: 'Currículo' }, { word: 'Erudition', translation: 'Erudição' },
        { word: 'Academic', translation: 'Acadêmico' }, { word: 'Knowledge', translation: 'Conhecimento' },
        { word: 'Research', translation: 'Pesquisa' }, { word: 'Literature', translation: 'Literatura' },
        { word: 'Scholarship', translation: 'Bolsa de estudos' }, { word: 'Assignment', translation: 'Tarefa' },
        { word: 'University', translation: 'Universidade' }, { word: 'Graduation', translation: 'Graduação' }
      ],
      basics: [
        { word: 'Conversation', translation: 'Conversa' }, { word: 'Vocabulary', translation: 'Vocabulário' },
        { word: 'Pronunciation', translation: 'Pronúncia' }, { word: 'Grammar', translation: 'Gramática' },
        { word: 'Understanding', translation: 'Entendimento' }, { word: 'Practice', translation: 'Prática' },
        { word: 'Question', translation: 'Pergunta' }, { word: 'Answer', translation: 'Resposta' },
        { word: 'Learning', translation: 'Aprendizado' }, { word: 'Exercise', translation: 'Exercício' }
      ]
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
