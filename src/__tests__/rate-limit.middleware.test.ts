import request from 'supertest';
import express from 'express';
import { rateLimit } from '../middleware/rate-limit.middleware.js';
import { usageStore } from '../store.js';
import { MAX_WORDS_PER_DAY } from '../services/rate-limit.service.js';

describe('Rate Limit Middleware', () => {
    let app: express.Application;
    const token = 'test-token';
    const today = new Date().toISOString().split('T')[0];

    beforeEach(() => {
        usageStore.clear();
        app = express();
        app.use(express.text());

        // Mock user attachment (simulating auth middleware)
        app.use((req, res, next) => {
            req.user = { email: 'test@example.com', token };
            next();
        });

        app.post('/justify', rateLimit, (req, res) => {
            res.status(200).send('Success');
        });
    });

    it('should allow request within limit', async () => {
        await request(app)
            .post('/justify')
            .set('Content-Type', 'text/plain')
            .send('word '.repeat(100))
            .expect(200);

        expect(usageStore.get(token)?.words).toBe(100);
    });

    it('should return 402 when limit exceeded', async () => {
        // Set usage to limit
        usageStore.set(token, {
            words: MAX_WORDS_PER_DAY,
            lastReset: today,
        });

        const response = await request(app)
            .post('/justify')
            .set('Content-Type', 'text/plain')
            .send('one more word')
            .expect(402);

        expect(response.body.error).toBe('Payment Required');
    });

    it('should count words correctly based on whitespace', async () => {
        await request(app)
            .post('/justify')
            .set('Content-Type', 'text/plain')
            .send('  word1   word2\nword3  ')
            .expect(200);

        expect(usageStore.get(token)?.words).toBe(3);
    });
});
