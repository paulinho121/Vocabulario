import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/generate-words', async (req, res) => {
  const { language, theme, learnedWordIds } = req.body;
  
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

    console.log(`Generating B2 session for ${language} - ${theme}...`);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);
    res.json(data);

  } catch (error: any) {
    console.error('API ERROR:', error.message);
    
    // Theme-aware Fallback (10 words to ensure navigation works)
    const fallbacks: Record<string, any[]> = {
      travel: [
        { word: 'Itinerary', translation: 'Itinerário' }, { word: 'Expedition', translation: 'Expedição' },
        { word: 'Sojourn', translation: 'Estadia' }, { word: 'Picturesque', translation: 'Pitoresco' },
        { word: 'Vibrant', translation: 'Vibrante' }, { word: 'Heritage', translation: 'Patrimônio' },
        { word: 'Destination', translation: 'Destino' }, { word: 'Landscape', translation: 'Paisagem' },
        { word: 'Atmosphere', translation: 'Atmosfera' }, { word: 'Excursion', translation: 'Excursão' }
      ],
      work: [
        { word: 'Resilience', translation: 'Resiliência' }, { word: 'Prerequisite', translation: 'Pré-requisito' },
        { word: 'Collaboration', translation: 'Colaboração' }, { word: 'Strategic', translation: 'Estratégico' },
        { word: 'Efficiency', translation: 'Eficiência' }, { word: 'Leadership', translation: 'Liderança' },
        { word: 'Innovation', translation: 'Inovação' }, { word: 'Competence', translation: 'Competência' },
        { word: 'Productivity', translation: 'Produtividade' }, { word: 'Trajectory', translation: 'Trajetória' }
      ],
      school: [
        { word: 'Curriculum', translation: 'Currículo' }, { word: 'Erudition', translation: 'Erudição' },
        { word: 'Pedagogy', translation: 'Pedagogia' }, { word: 'Cognitive', translation: 'Cognitivo' },
        { word: 'Dissertation', translation: 'Dissertação' }, { word: 'Hypothesis', translation: 'Hipótese' },
        { word: 'Academic', translation: 'Acadêmico' }, { word: 'Scholarship', translation: 'Bolsa de estudos' },
        { word: 'Instruction', translation: 'Instrução' }, { word: 'Discipline', translation: 'Disciplina' }
      ]
    };

    const selectedList = fallbacks[theme as string] || fallbacks.work;
    res.json({
      words: selectedList.map((item, idx) => ({
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
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
