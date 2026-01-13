import request from 'supertest';
import app from '../app.js';
import { tokenStore } from '../store.js';

describe('POST /api/token', () => {
  beforeEach(() => {
    // Clear token store before each test
    tokenStore.clear();
  });

  it('should generate a token for a valid email', async () => {
    const response = await request(app)
      .post('/api/token')
      .send({ email: 'test@example.com' })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');
    expect(response.body.token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );

    // Verify token is stored
    expect(tokenStore.has(response.body.token)).toBe(true);
    expect(tokenStore.get(response.body.token)).toBe('test@example.com');
  });

  it('should return 400 when email is missing', async () => {
    const response = await request(app).post('/api/token').send({}).expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Bad Request');
    expect(response.body.message).toBe('Email is required');
  });

  it('should return 400 when email is not a string', async () => {
    const response = await request(app).post('/api/token').send({ email: 123 }).expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Bad Request');
    expect(response.body.message).toBe('Email is required');
  });

  it('should return 400 when email is empty string', async () => {
    const response = await request(app).post('/api/token').send({ email: '' }).expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Bad Request');
    expect(response.body.message).toBe('Email is required');
  });

  it('should generate different tokens for the same email', async () => {
    const response1 = await request(app)
      .post('/api/token')
      .send({ email: 'test@example.com' })
      .expect(200);

    const response2 = await request(app)
      .post('/api/token')
      .send({ email: 'test@example.com' })
      .expect(200);

    expect(response1.body.token).not.toBe(response2.body.token);
  });

  it('should handle multiple different emails', async () => {
    const email1 = 'user1@example.com';
    const email2 = 'user2@example.com';

    const response1 = await request(app).post('/api/token').send({ email: email1 }).expect(200);

    const response2 = await request(app).post('/api/token').send({ email: email2 }).expect(200);

    expect(tokenStore.get(response1.body.token)).toBe(email1);
    expect(tokenStore.get(response2.body.token)).toBe(email2);
  });
});
