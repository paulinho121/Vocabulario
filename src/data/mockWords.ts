import { Word } from '../types';

export const mockWords: Record<string, Word[]> = {
  en: [
    {
      id: 'en_1',
      word: 'to run',
      translation: 'correr',
      partOfSpeech: 'verb',
      theme: 'basics',
      sentences: {
        present: 'I run every morning.',
        past: 'I ran yesterday.',
        future: 'I will run tomorrow.'
      }
    },
    {
      id: 'en_2',
      word: 'apple',
      translation: 'maçã',
      partOfSpeech: 'noun',
      theme: 'food',
      sentences: {
        present: 'I eat an apple.',
        past: 'I ate an apple.',
        future: 'I will eat an apple.'
      }
    },
    {
      id: 'en_3',
      word: 'beautiful',
      translation: 'bonito(a)',
      partOfSpeech: 'adjective',
      theme: 'descriptions',
      sentences: {
        present: 'The view is beautiful.',
        past: 'The view was beautiful.',
        future: 'The view will be beautiful.'
      }
    },
    {
      id: 'en_4',
      word: 'quickly',
      translation: 'rapidamente',
      partOfSpeech: 'adverb',
      theme: 'basics',
      sentences: {
        present: 'He works quickly.',
        past: 'He worked quickly.',
        future: 'He will work quickly.'
      }
    },
    {
      id: 'en_5',
      word: 'journey',
      translation: 'jornada / viagem',
      partOfSpeech: 'noun',
      theme: 'travel',
      sentences: {
        present: 'The journey takes two hours.',
        past: 'The journey took two hours.',
        future: 'The journey will take two hours.'
      }
    },
    {
      id: 'en_6',
      word: 'to achieve',
      translation: 'alcançar / conquistar',
      partOfSpeech: 'verb',
      theme: 'work',
      sentences: {
        present: 'She achieves her goals.',
        past: 'She achieved her goals.',
        future: 'She will achieve her goals.'
      }
    },
    {
      id: 'en_7',
      word: 'meeting',
      translation: 'reunião',
      partOfSpeech: 'noun',
      theme: 'work',
      sentences: {
        present: 'We have a meeting now.',
        past: 'We had a meeting yesterday.',
        future: 'We will have a meeting later.'
      }
    },
    {
      id: 'en_8',
      word: 'airport',
      translation: 'aeroporto',
      partOfSpeech: 'noun',
      theme: 'travel',
      sentences: {
        present: 'The airport is busy.',
        past: 'The airport was empty.',
        future: 'The airport will be crowded.'
      }
    },
    {
      id: 'en_9',
      word: 'expensive',
      translation: 'caro',
      partOfSpeech: 'adjective',
      theme: 'shopping',
      sentences: {
        present: 'This shirt is expensive.',
        past: 'That car was expensive.',
        future: 'The trip will be expensive.'
      }
    },
    {
      id: 'en_10',
      word: 'to learn',
      translation: 'aprender',
      partOfSpeech: 'verb',
      theme: 'school',
      sentences: {
        present: 'I learn new words every day.',
        past: 'I learned a lot yesterday.',
        future: 'I will learn Spanish next year.'
      }
    }
  ],
  es: [
    {
      id: 'es_1',
      word: 'correr',
      translation: 'to run',
      partOfSpeech: 'verb',
      theme: 'basics',
      sentences: {
        present: 'Yo corro todos los días.',
        past: 'Yo corrí ayer.',
        future: 'Yo correré mañana.'
      }
    },
    {
      id: 'es_2',
      word: 'manzana',
      translation: 'apple',
      partOfSpeech: 'noun',
      theme: 'food',
      sentences: {
        present: 'Yo como una manzana.',
        past: 'Yo comí una manzana.',
        future: 'Yo comeré una manzana.'
      }
    }
  ]
};

export function getDailyWords(language: string, learnedWordIds: string[]): Word[] {
  const allWords = mockWords[language] || mockWords['en'];
  const unlearned = allWords.filter(w => !learnedWordIds.includes(w.id));
  return unlearned.slice(0, 5);
}
