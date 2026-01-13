import { checkRateLimit, MAX_WORDS_PER_DAY } from '../services/rate-limit.service.js';
import { usageStore } from '../store.js';

describe('Rate Limit Service', () => {
    const token = 'test-token';
    const today = new Date().toISOString().split('T')[0];

    beforeEach(() => {
        usageStore.clear();
    });

    it('should allow request within limit', () => {
        expect(checkRateLimit(token, 100)).toBe(true);
        expect(usageStore.get(token)).toEqual({
            words: 100,
            lastReset: today,
        });
    });

    it('should accumulate usage correctly', () => {
        checkRateLimit(token, 100);
        checkRateLimit(token, 200);

        expect(usageStore.get(token)?.words).toBe(300);
    });

    it('should block request exceeding limit', () => {
        expect(checkRateLimit(token, MAX_WORDS_PER_DAY + 1)).toBe(false);
    });

    it('should block accumulated usage exceeding limit', () => {
        usageStore.set(token, {
            words: MAX_WORDS_PER_DAY - 100,
            lastReset: today,
        });

        expect(checkRateLimit(token, 101)).toBe(false);
    });

    it('should reset usage on new day', () => {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        usageStore.set(token, {
            words: MAX_WORDS_PER_DAY,
            lastReset: yesterday,
        });

        expect(checkRateLimit(token, 100)).toBe(true);
        expect(usageStore.get(token)).toEqual({
            words: 100,
            lastReset: today,
        });
    });
});
