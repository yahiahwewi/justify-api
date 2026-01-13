import request from 'supertest';
import express, { type Application } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { tokenStore } from '../store.js';

describe('Authentication Middleware', () => {
    let app: Application;
    const validToken = 'test-token-123';
    const validEmail = 'test@example.com';

    beforeEach(() => {
        // Clear token store before each test
        tokenStore.clear();

        // Create a fresh Express app for each test
        app = express();
        app.use(express.json());

        // Create a protected test route
        app.get('/protected', authenticate, (req, res) => {
            res.json({
                message: 'Access granted',
                user: (req as any).user,
            });
        });

        // Add a valid token to the store
        tokenStore.set(validToken, validEmail);
    });

    describe('Successful Authentication', () => {
        it('should allow access with valid Bearer token', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200);

            expect(response.body.message).toBe('Access granted');
            expect(response.body.user).toEqual({
                email: validEmail,
                token: validToken,
            });
        });
    });

    describe('Missing Authorization Header', () => {
        it('should reject requests without Authorization header', async () => {
            const response = await request(app).get('/protected').expect(401);

            expect(response.body.error).toBe('Authentication required');
            expect(response.body.message).toContain('Authorization header');
        });
    });

    describe('Invalid Authorization Format', () => {
        it('should reject malformed Authorization header (no space)', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', 'BearerInvalidFormat')
                .expect(401);

            expect(response.body.error).toBe('Invalid authorization format');
            expect(response.body.message).toContain('Bearer <token>');
        });

        it('should reject Authorization header with too many parts', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', 'Bearer token extra-part')
                .expect(401);

            expect(response.body.error).toBe('Invalid authorization format');
        });

        it('should reject Authorization header with only scheme', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', 'Bearer')
                .expect(401);

            expect(response.body.error).toBe('Invalid authorization format');
        });
    });

    describe('Invalid Authentication Scheme', () => {
        it('should reject Basic authentication scheme', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', 'Basic dGVzdDp0ZXN0')
                .expect(401);

            expect(response.body.error).toBe('Invalid authentication scheme');
            expect(response.body.message).toContain('Bearer token');
        });

        it('should reject custom authentication scheme', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', 'Custom my-token')
                .expect(401);

            expect(response.body.error).toBe('Invalid authentication scheme');
        });
    });

    describe('Empty Token', () => {
        it('should reject empty token', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', 'Bearer ')
                .expect(401);

            expect(response.body.error).toBe('Invalid authorization format');
        });

        it('should reject whitespace-only token', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', 'Bearer    ')
                .expect(401);

            expect(response.body.error).toBe('Invalid authorization format');
        });
    });

    describe('Invalid or Expired Token', () => {
        it('should reject token that does not exist in store', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', 'Bearer non-existent-token')
                .expect(401);

            expect(response.body.error).toBe('Invalid or expired token');
            expect(response.body.message).toContain('not valid');
        });

        it('should reject token after it has been removed from store', async () => {
            // Remove the token from the store
            tokenStore.delete(validToken);

            const response = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(401);

            expect(response.body.error).toBe('Invalid or expired token');
        });
    });

    describe('User Context Attachment', () => {
        it('should attach user context to request object', async () => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200);

            expect(response.body.user).toBeDefined();
            expect(response.body.user.email).toBe(validEmail);
            expect(response.body.user.token).toBe(validToken);
        });

        it('should work with multiple different tokens', async () => {
            const token2 = 'another-token';
            const email2 = 'another@example.com';
            tokenStore.set(token2, email2);

            const response1 = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200);

            const response2 = await request(app)
                .get('/protected')
                .set('Authorization', `Bearer ${token2}`)
                .expect(200);

            expect(response1.body.user.email).toBe(validEmail);
            expect(response2.body.user.email).toBe(email2);
        });
    });
});
