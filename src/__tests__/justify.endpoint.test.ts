import request from 'supertest';
import app from '../app.js';
import { tokenStore, usageStore } from '../store.js';

describe('POST /api/justify', () => {
  let validToken: string;
  const validEmail = 'test@example.com';

  beforeEach(() => {
    tokenStore.clear();
    usageStore.clear();

    // Generate a token for testing
    validToken = 'test-token-123';
    tokenStore.set(validToken, validEmail);
  });

  it('should justify text successfully with valid token', async () => {
    const text = 'This is a test. This is only a test.';

    const response = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${validToken}`)
      .set('Content-Type', 'text/plain')
      .send(text)
      .expect(200);

    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.text).toBeTruthy();
  });

  it('should return 401 without authorization header', async () => {
    const response = await request(app)
      .post('/api/justify')
      .set('Content-Type', 'text/plain')
      .send('Some text')
      .expect(401);

    expect(response.body.error).toBe('Authentication required');
  });

  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .post('/api/justify')
      .set('Authorization', 'Bearer invalid-token')
      .set('Content-Type', 'text/plain')
      .send('Some text')
      .expect(401);

    expect(response.body.error).toBe('Invalid or expired token');
  });

  it('should return 400 with empty body', async () => {
    const response = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${validToken}`)
      .set('Content-Type', 'text/plain')
      .send('')
      .expect(400);

    expect(response.body.error).toBe('Bad Request');
  });

  it('should enforce rate limiting', async () => {
    const today = new Date().toISOString().split('T')[0];

    // Set usage to the limit
    usageStore.set(validToken, {
      words: 80000,
      lastReset: today || '',
    });

    const response = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${validToken}`)
      .set('Content-Type', 'text/plain')
      .send('This will exceed the limit')
      .expect(402);

    expect(response.body.error).toBe('Payment Required');
  });

  it('should handle long text correctly', async () => {
    const longText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';

    const response = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${validToken}`)
      .set('Content-Type', 'text/plain')
      .send(longText)
      .expect(200);

    const lines = response.text.split('\n');
    // First line should be exactly 80 chars (justified)
    expect(lines[0]?.length).toBe(80);
  });
});
