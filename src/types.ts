export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

export interface Word {
  id: string;
  word: string;
  translation: string;
  partOfSpeech: string;
  theme: string;
  sentences: {
    present: string;
    past: string;
    future: string;
  };
  audioUrl?: string; // We'll use Web Speech API for TTS if no URL is provided
}

export interface UserWord extends Word {
  learnedAt: number;
  nextReviewAt: number;
  interval: number; // in days
  repetition: number;
  easeFactor: number;
  isFavorite: boolean;
}

export interface Story {
  text: string;
  translation: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}
