import request from 'supertest';
import app from '../app.js';
import { tokenStore } from '../store.js';

describe('Integration Test: /api/token Endpoint', () => {
  beforeEach(() => {
    // Ensuring each test starts with an empty token store
    tokenStore.clear();
  });

  /**
   * Scenario: Token request with valid email
   * Importance: Core authentication flow. Users need this token for all other endpoints.
   */
  it('should generate a valid UUID token for a valid email', async () => {
    const email = 'test@example.com';
    const response = await request(app)
      .post('/api/token')
      .send({ email })
      .expect('Content-Type', /json/)
      .expect(200);

    // Validate UUID format
    expect(response.body.token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );

    // Ensure the mapping is correctly stored in-memory
    expect(tokenStore.get(response.body.token)).toBe(email);
  });

  /**
   * Scenario: Token request with missing or invalid email
   * Importance: Data validation prevents downstream errors and identifies client mistakes.
   */
  it('should return 400 when email is missing or malformed', async () => {
    // Case 1: Missing email
    const res1 = await request(app).post('/api/token').send({}).expect(400);
    expect(res1.body.error).toBe('Bad Request');
    expect(res1.body.message).toBe('Email is required');

    // Case 2: Empty string
    const res2 = await request(app).post('/api/token').send({ email: '' }).expect(400);
    expect(res2.body.message).toBe('Email is required');

    // Case 3: Wrong type
    const res3 = await request(app).post('/api/token').send({ email: 123 }).expect(400);
    expect(res3.body.message).toBe('Email is required');
  });

  /**
   * Scenario: Multiple tokens for same email
   * Importance: Standard behavior — re-requesting a token should simply issue a new one.
   */
  it('should issue unique tokens on every valid request', async () => {
    const email = 'repeat@example.com';

    const res1 = await request(app).post('/api/token').send({ email }).expect(200);
    const res2 = await request(app).post('/api/token').send({ email }).expect(200);

    expect(res1.body.token).not.toBe(res2.body.token);
    // Both tokens should work independently
    expect(tokenStore.has(res1.body.token)).toBe(true);
    expect(tokenStore.has(res2.body.token)).toBe(true);
  });
});
