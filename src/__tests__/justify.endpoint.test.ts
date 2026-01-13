import request from 'supertest';
import app from '../app.js';
import { tokenStore, usageStore } from '../store.js';

describe('Integration Test: /api/justify Endpoint', () => {
  let validToken: string;
  const validEmail = 'test@example.com';

  beforeEach(() => {
    // Reset our in-memory stores before each test to ensure isolation
    tokenStore.clear();
    usageStore.clear();

    // Setup a clean state with one valid token
    validToken = 'test-token-123';
    tokenStore.set(validToken, validEmail);
  });

  /**
   * Scenario: Successful justification with a valid token
   * Importance: Verifies the primary happy path of the application.
   */
  it('should justify text successfully when authorized', async () => {
    const text = 'The quick brown fox jumps over the lazy dog repeatedly to create long enough content.';

    const response = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${validToken}`)
      .set('Content-Type', 'text/plain')
      .send(text)
      .expect(200);

    // Verify response headers and body format
    expect(response.headers['content-type']).toContain('text/plain');
    expect(typeof response.text).toBe('string');
  });

  /**
   * Scenario: Request without Authorization header
   * Importance: Ensures security middleware is active and blocking unauthorized access.
   */
  it('should reject requests missing the Authorization header', async () => {
    const response = await request(app)
      .post('/api/justify')
      .set('Content-Type', 'text/plain')
      .send('Protected content')
      .expect(401);

    expect(response.body.error).toBe('Unauthorized');
    expect(response.body.message).toContain('Authorization header');
  });

  /**
   * Scenario: Request with invalid token
   * Importance: Verifies that only tokens issued by /api/token are accepted.
   */
  it('should reject requests with an unrecognized token', async () => {
    const response = await request(app)
      .post('/api/justify')
      .set('Authorization', 'Bearer invalid-token')
      .set('Content-Type', 'text/plain')
      .send('Protected content')
      .expect(401);

    expect(response.body.error).toBe('Unauthorized');
  });

  /**
   * Scenario: Request with missing body content
   * Importance: Verifies API robustness against malformed or empty requests.
   */
  it('should return 400 when the request body is empty', async () => {
    const response = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${validToken}`)
      .set('Content-Type', 'text/plain')
      .send('')
      .expect(400);

    expect(response.body.error).toBe('Bad Request');
    expect(response.body.message).toBe('Request body must contain text to justify');
  });

  /**
   * Scenario: Daily quota exceeded
   * Importance: Validates the rate limiting business logic (80,000 words limit).
   */
  it('should enforce the daily word limit (402 Payment Required)', async () => {
    const today = new Date().toISOString().split('T')[0];

    // Artificially set usage to the limit
    usageStore.set(validToken, {
      words: 80000,
      lastReset: today || '',
    });

    const response = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${validToken}`)
      .set('Content-Type', 'text/plain')
      .send('This single word will exceed the quota')
      .expect(402);

    expect(response.body.error).toBe('Payment Required');
    expect(response.body.message).toContain('80,000 words exceeded');
  });

  /**
   * Scenario: Full flow with long text
   * Importance: Comprehensive check of integration between auth, rate-limit, and justification.
   */
  it('should correctly format and return long text flow', async () => {
    const longText =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
      'Pellentesque et placerat enim. Duis hilla non ante dapibus facibus. ' +
      'Curabitur interdum ante eros, vel varius nisi iaculis a. ' +
      'Sed quis est sit amet justo elementum vulputate.';

    const response = await request(app)
      .post('/api/justify')
      .set('Authorization', `Bearer ${validToken}`)
      .set('Content-Type', 'text/plain')
      .send(longText)
      .expect(200);

    const lines = response.text.split('\n');
    // First line must be exactly 80 chars
    expect(lines[0]?.length).toBe(80);

    // Usage should have been tracked
    const usage = usageStore.get(validToken);
    expect(usage?.words).toBeGreaterThan(0);
  });
});
