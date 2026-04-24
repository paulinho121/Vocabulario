import { Word, Story } from '../types';

export async function generateAIVocabulary(language: string, theme: string, learnedWordIds: string[]): Promise<{ words: Word[], story: Story | null }> {
  try {
    const response = await fetch('/api/generate-words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        theme,
        learnedWordIds,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate vocabulary');
    }

    const data = await response.json();
    return {
      words: data.words || [],
      story: data.story ? { text: data.story.text || data.story, translation: data.story.translation } : null
    };
  } catch (error) {
    console.error('Gemini Service Error:', error);
    return { words: [], story: null };
  }
}
