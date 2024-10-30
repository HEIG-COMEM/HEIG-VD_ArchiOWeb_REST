import supertest from 'supertest';
import app from '../app.js';

test('GET /status', async () => {
    const response = await supertest(app).get('/api/v1/status');
    expect(response.status).toBe(200);
});
