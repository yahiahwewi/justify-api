import request from 'supertest';
import app from '../app.js';
import { tokenStore, usageStore } from '../store.js';

describe('Test d\'Intégration : API Justify', () => {
    beforeEach(() => {
        tokenStore.clear();
        usageStore.clear();
    });

    it('doit générer un token pour un email valide', async () => {
        const res = await request(app)
            .post('/api/token')
            .send({ email: 'test@example.com' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(tokenStore.has(res.body.token)).toBe(true);
    });

    it('doit justifier du texte avec un token valide', async () => {
        // 1. Obtenir un token
        const authRes = await request(app)
            .post('/api/token')
            .send({ email: 'user@example.com' });
        const token = authRes.body.token;

        // 2. Justifier
        const res = await request(app)
            .post('/api/justify')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'text/plain')
            .send("Texte à justifier qui doit être assez long pour tester le mécanisme de manière basique.");

        expect(res.status).toBe(200);
        expect(typeof res.text).toBe('string');
    });

    it('doit renvoyer 401 si le token est manquant', async () => {
        const res = await request(app)
            .post('/api/justify')
            .set('Content-Type', 'text/plain')
            .send("Du texte.");

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Unauthorized');
    });

    it('doit renvoyer 402 si la limite de mots est dépassée', async () => {
        const authRes = await request(app)
            .post('/api/token')
            .send({ email: 'user@limit.com' });
        const token = authRes.body.token;

        // Simuler un usage important (80 000 mots)
        usageStore.set(token, { words: 80000, lastReset: new Date().toISOString().split('T')[0]! });

        const res = await request(app)
            .post('/api/justify')
            .set('Authorization', `Bearer ${token}`)
            .set('Content-Type', 'text/plain')
            .send("Un mot de trop.");

        expect(res.status).toBe(402);
        expect(res.body.error).toBe('Payment Required');
    });
});
