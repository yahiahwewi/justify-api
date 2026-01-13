import request from 'supertest';
import app from '../app.js';

describe('Error Handling Middleware', () => {
  describe('404 Not Found Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/api/nonexistent').expect(404);

      expect(response.body.error).toBe('Not Found');
      expect(response.body.message).toContain('Route GET /api/nonexistent not found');
    });

    it('should return 404 for POST to undefined route', async () => {
      const response = await request(app).post('/api/undefined').send({}).expect(404);

      expect(response.body.error).toBe('Not Found');
      expect(response.body.message).toContain('POST');
    });
  });

  describe('Consistent Error Responses', () => {
    it('should return consistent error format for auth errors', async () => {
      const response = await request(app)
        .post('/api/justify')
        .set('Content-Type', 'text/plain')
        .send('Some text')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should return consistent error format for validation errors', async () => {
      const response = await request(app).post('/api/token').send({}).expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Email is required');
    });
  });
});
