/**
 * Spaced Repetition System (SRS) using the SM-2 algorithm.
 * 
 * Quality (q):
 * 5: perfect response
 * 4: correct response after a hesitation
 * 3: correct response recalled with serious difficulty
 * 2: incorrect response; where the correct one seemed easy to recall
 * 1: incorrect response; the correct one remembered
 * 0: complete blackout.
 */

export interface SRSState {
  interval: number; // in days
  repetition: number;
  easeFactor: number;
}

export function calculateSRS(quality: number, previousState: SRSState) {
  let { interval, repetition, easeFactor } = previousState;

  if (quality >= 3) {
    // Correct response
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  } else {
    // Incorrect response
    repetition = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return {
    interval,
    repetition,
    easeFactor,
    nextReviewAt: Date.now() + interval * 24 * 60 * 60 * 1000
  };
}
