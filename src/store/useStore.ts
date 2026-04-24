import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, Story, UserWord, Word } from '../types';
import { getDailyWords } from '../data/mockWords';
import { isToday, isYesterday } from 'date-fns';
import { generateAIVocabulary } from '../lib/gemini';
import { calculateSRS } from '../lib/srs';

interface AppState {
  language: Language;
  targetLanguage: Language;
  setTargetLanguage: (lang: Language) => void;
  
  learnedUserWords: UserWord[];
  
  streak: number;
  lastActiveDate: number | null;
  checkStreak: () => void;
  
  dailyWords: Word[];
  dailyStory: Story | null;
  dailyProgress: number; // 0 to 5
  isDailyComplete: boolean;
  isLoading: boolean;
  targetTheme: string;
  setTargetTheme: (theme: string) => void;
  
  generateDailySession: () => Promise<void>;
  markWordLearned: (word: Word, quality: number, isFavorite?: boolean) => void;
  toggleFavorite: (wordId: string) => void;
  
  resetDaily: () => void; // For testing
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'pt', // Native lang
      targetLanguage: 'en',
      
      setTargetLanguage: (lang) => { 
        set({ targetLanguage: lang, dailyWords: [], dailyProgress: 0, isDailyComplete: false });
        get().generateDailySession();
      },
      
      learnedUserWords: [],
      
      streak: 0,
      lastActiveDate: null,
      
      checkStreak: () => {
        const { lastActiveDate, streak } = get();
        const now = Date.now();
        if (!lastActiveDate) return;
        
        if (isYesterday(lastActiveDate)) {
          // Streak is active, wait for completion to increment
        } else if (!isToday(lastActiveDate) && !isYesterday(lastActiveDate)) {
          set({ streak: 0 }); // Lost streak
        }
      },
      
      dailyWords: [],
      dailyStory: null,
      dailyProgress: 0,
      isDailyComplete: false,
      isLoading: false,
      targetTheme: 'basics',

      setTargetTheme: (theme) => set({ targetTheme: theme }),
      
      generateDailySession: async () => {
        const { targetLanguage, learnedUserWords, dailyWords, lastActiveDate, isDailyComplete, isLoading, targetTheme } = get();
        
        if (isLoading) return;
        
        // If we already generated today and finished, keep it complete
        if (lastActiveDate && isToday(lastActiveDate) && isDailyComplete) {
           return;
        }
        
        // If we have daily words and it's today, resume
        if (dailyWords.length > 0 && lastActiveDate && isToday(lastActiveDate)) {
            return;
        }

        set({ isLoading: true });

        try {
          // 1. Find words due for review
          const now = Date.now();
          const dueReviews = learnedUserWords
            .filter(w => w.nextReviewAt <= now)
            .sort((a, b) => a.nextReviewAt - b.nextReviewAt)
            .slice(0, 5); // Max 5 reviews per session

          // 2. Fetch new words from Gemini if needed
          const totalTarget = 10;
          const neededNewCount = totalTarget - dueReviews.length;
          let newWords: Word[] = [];
          let story: Story | null = null;
          
          if (neededNewCount > 0) {
            const learnedIds = learnedUserWords.map(uw => uw.id);
            const data = await generateAIVocabulary(targetLanguage, targetTheme, learnedIds);
            newWords = data.words;
            story = data.story;
          }
          
          set({ 
            dailyWords: [...dueReviews, ...newWords], 
            dailyStory: story,
            dailyProgress: 0, 
            isDailyComplete: false 
          });
        } finally {
          set({ isLoading: false });
        }
      },
      
      markWordLearned: (word, quality, isFavorite = false) => {
        set((state) => {
          // Check if word already exists in learned (for reviews)
          const existing = state.learnedUserWords.find(w => w.id === word.id);
          
          const srsState = existing ? {
            interval: existing.interval,
            repetition: existing.repetition,
            easeFactor: existing.easeFactor
          } : {
            interval: 0,
            repetition: 0,
            easeFactor: 2.5
          };

          const newSRS = calculateSRS(quality, srsState);

          const userWord: UserWord = {
            ...word,
            ...newSRS,
            learnedAt: existing?.learnedAt || Date.now(),
            isFavorite: isFavorite || (existing?.isFavorite ?? false)
          };
          
          // Update learned list
          const otherLearned = state.learnedUserWords.filter(w => w.id !== word.id);
          const newLearned = [...otherLearned, userWord];
          
          const newProgress = state.dailyProgress + 1;
          const isComplete = newProgress >= state.dailyWords.length;
          
          let newStreak = state.streak;
          let newLastActive = state.lastActiveDate;
          
          if (isComplete) {
             if (state.lastActiveDate && isYesterday(state.lastActiveDate)) {
                 newStreak += 1;
             } else if (!state.lastActiveDate || (!isToday(state.lastActiveDate) && !isYesterday(state.lastActiveDate))) {
                 newStreak = 1;
             }
             newLastActive = Date.now();
          }

          return {
            learnedUserWords: newLearned,
            dailyProgress: newProgress,
            isDailyComplete: isComplete,
            streak: newStreak,
            lastActiveDate: newLastActive || Date.now()
          };
        });
      },
      
      toggleFavorite: (wordId) => {
        set((state) => ({
          learnedUserWords: state.learnedUserWords.map(w => 
            w.id === wordId ? { ...w, isFavorite: !w.isFavorite } : w
          )
        }));
      },
      
      resetDaily: () => {
         set({ dailyWords: [], dailyProgress: 0, isDailyComplete: false, lastActiveDate: null });
      }
    }),
    {
      name: 'lingobite-storage',
    }
  )
);
