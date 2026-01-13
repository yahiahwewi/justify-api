// In-memory token storage
// Maps token (UUID) to user info (email, etc.)
export const tokenStore = new Map<string, string>();

interface TokenUsage {
  words: number;
  lastReset: string; // ISO date string YYYY-MM-DD
}

// Maps token to usage statistics
export const usageStore = new Map<string, TokenUsage>();
