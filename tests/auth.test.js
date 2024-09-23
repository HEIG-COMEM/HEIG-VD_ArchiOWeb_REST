import mongoose from 'mongoose';
import supertest from 'supertest';

import app from '../app.js';
import { baseUrl } from '../config.js';
import { cleanUpDatabase } from './utils.js';

// Clean up leftover data in the database before starting to test
beforeAll(cleanUpDatabase);

const href = `/api/v1/auth`;

describe('Authentication', () => {
    test('POST /signup', async () => {
        const response = await supertest(app).post(`${href}/signup`).send({
            name: 'Test Employer',
            email: 'testEmployer@gmail.com',
            password: '1234',
            role: 'employer',
            phone: '1234567890',
        });

        // Check that the status and headers of the response are correct.
        expect(response.status).toBe(201);
        expect(response.get('Content-Type')).toContain('application/json');

        // Check that the response body is the created user.
        expect(response.body).toMatchObject({
            name: 'Test Employer',
            email: 'testEmployer@gmail.com',
            phone: '1234567890',
            role: 'employer',
            profilePictureUrl: expect.any(String),
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
        });
    });

    // Test that the user cannot access the /user route without a token.
    test('GET /user', async () => {
        const response = await supertest(app).get(`${href}/user`);
        expect(response.status).toBe(401);
    });

    // Test that the user can log in and get a token.
    test('POST /login', async () => {
        const response = await supertest(app).post(`${href}/login`).send({
            email: 'testEmployer@gmail.com',
            password: '1234'
        });

        expect(response.status).toBe(200);
        expect(response.get('Content-Type')).toContain('application/json');
        expect(response.body).toMatchObject({
            token: expect.any(String),
        });
    });

    // Test that the user can access the /user route with a token.
    test('GET /user after login', async () => {
        const loginResponse = await supertest(app).post(`${href}/login`).send({
            email: 'testEmployer@gmail.com',
            password: '1234'
        });

        const token = loginResponse.body.token;
        const response = await supertest(app).get(`${href}/user`).set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.get('Content-Type')).toContain('application/json');

        // Check that the response body is the logged in user.
        expect(response.body).toMatchObject({
            name: 'Test Employer',
            email: 'testEmployer@gmail.com',
            phone: '1234567890',
            role: 'employer',
            profilePictureUrl: expect.any(String),
            _id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
        });
    });
});

// Clean up leftover data in the database after testing
afterAll(cleanUpDatabase);