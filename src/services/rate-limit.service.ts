import { usageStore } from '../store.js';

export const MAX_WORDS_PER_DAY = 80000;

/**
 * Rate Limit Service
 *
 * Manages the daily word usage quota per token.
 * Enforces the business rule of 80,000 words per day.
 */

// Helper to get current date as YYYY-MM-DD string
// Used to track daily usage resets
const getCurrentDate = (): string => new Date().toISOString().split('T')[0] || '';

/**
 * Checks if a token has enough quota for the requested word count.
 * Also handles daily resets if the date has changed.
 *
 * @param token - The user's authentication token
 * @param wordCount - Number of words to process
 * @returns boolean - true if allowed, false if limit exceeded
 */
export const checkRateLimit = (token: string, wordCount: number): boolean => {
  const today = getCurrentDate();
  const usage = usageStore.get(token);

  // If new user or different day, reset/init counter
  // The counter is reset daily to match the business rule of
  // "80,000 words per token per day"
  if (!usage || usage.lastReset !== today) {
    // Check if the single request exceeds the daily limit itself
    if (wordCount > MAX_WORDS_PER_DAY) {
      return false; // Cannot process more than daily limit in one go
    }

    usageStore.set(token, {
      words: wordCount,
      lastReset: today,
    });
    return true;
  }

  // Check if adding current request exceeds limit
  if (usage.words + wordCount > MAX_WORDS_PER_DAY) {
    return false;
  }

  // Update usage count
  usage.words += wordCount;
  usageStore.set(token, usage);
  return true;
};
