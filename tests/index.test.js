import supertest from 'supertest';
import app from '../app.js';

describe('GET /status', () => {
    test('should return 200 and "OK"', async () => {
        const response = await supertest(app).get('/api/v1/status');
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ status: 'OK' });
    });
});

describe('GET /nonexistingroute', () => {
    test('should return 404', async () => {
        const response = await supertest(app).get('/nonexistingroute');
        expect(response.status).toBe(404);
    });
});
