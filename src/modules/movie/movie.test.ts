import request from 'supertest';
import app from '@/app';
import { prisma } from '@/libs/prisma';

// Basic test template
describe('Movie API', () => {
  it('should return 200 for GET /movies', async () => {
    const response = await request(app).get('/api/v1/movies');
    expect(response.status).toBe(200);
  });
});
