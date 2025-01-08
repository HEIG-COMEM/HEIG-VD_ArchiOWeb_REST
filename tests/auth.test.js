import supertest from 'supertest';

import app from '../app.js';
import {
    cleanUpDatabase,
    disconnectDatabase,
    createRandomUser,
} from './utils/utils.js';

// Clean up leftover data in the database before starting to test
beforeEach(cleanUpDatabase);

const href = `/api/v1/auth`;

beforeEach(async () => {
    await createRandomUser({
        name: 'test.user',
        email: 'user@test.ch',
        password: '1234',
    }).save();
});

// Test the POST /signup route
describe('POST /signup', () => {
    // Test that the user can sign up with valid data.
    test('creates a new user with valid data return 200 and the user created', async () => {
        const response = await supertest(app).post(`${href}/signup`).send({
            name: 'test.user',
            email: 'a@a.al',
            password: '1234',
        });

        expect(response.status).toBe(201);
        expect(response.get('Content-Type')).toContain('application/json');
        expect(response.body).toMatchObject({
            _id: expect.any(String),
            name: 'test.user',
            email: 'a@a.al',
            role: 'user',
            profilePicture: {
                url: expect.any(String),
                id: expect.any(String),
            },
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
        });
    });

    // Test that the user cannot sign up with an invalid email.
    test('does not create a user with an invalid email', async () => {
        const response = await supertest(app).post(`${href}/signup`).send({
            name: 'test.user',
            email: 'a@a',
            password: '1234',
        });

        expect(response.status).toBe(422);
        expect(response.get('Content-Type')).toContain('application/json');
        expect(response.body).toContainKey('message');
        expect(response.body.message).toBe(
            'User validation failed: email: The email address is invalid or already in use by another user.'
        );
    });

    // Test that the user cannot sign up with an email that is already in use.
    test('does not create a user with an email that is already in use', async () => {
        await supertest(app).post(`${href}/signup`).send({
            name: 'test.user1',
            email: 'a@a.al',
            password: '1234',
        });
        const response = await supertest(app).post(`${href}/signup`).send({
            name: 'test.user2',
            email: 'a@a.al',
            password: '5678',
        });

        expect(response.status).toBe(422);
        expect(response.get('Content-Type')).toContain('application/json');
        expect(response.body).toContainKey('message');
        expect(response.body.message).toBe(
            'User validation failed: email: The email address is invalid or already in use by another user.'
        );
    });

    // Test that the user cannot sign up with a missing field.
    test('does not create a user with a missing name', async () => {
        const response = await supertest(app).post(`${href}/signup`).send({
            email: 'b@b.al',
            password: '1234',
        });

        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({
            message: 'Fields name, email, and password are required',
        });
    });
});

// Test the POST /login route
describe('POST /login', () => {
    // Test that the user can log in with valid data.
    test('logs in with valid data and returns a token', async () => {
        const response = await supertest(app).post(`${href}/login`).send({
            email: 'user@test.ch',
            password: '1234',
        });

        expect(response.status).toBe(200);
        expect(response.get('Content-Type')).toContain('application/json');
        expect(response.body).toContainKey('token');
    });

    // Test that the user cannot log in with an invalid email.
    test('does not log in with an invalid email', async () => {
        const response = await supertest(app).post(`${href}/login`).send({
            email: 'user.test.ch',
            password: '1234',
        });

        expect(response.status).toBe(401);
    });

    // Test that the user cannot log in with an invalid password.
    test('does not log in with an invalid password', async () => {
        const response = await supertest(app).post(`${href}/login`).send({
            email: 'user@test.ch',
            password: '5678',
        });

        expect(response.status).toBe(401);
    });

    // Test that the user cannot log in with a missing field.
    test('does not log in with a missing email', async () => {
        const response = await supertest(app).post(`${href}/login`).send({
            password: '1234',
        });

        expect(response.status).toBe(401);
    });

    // Test that the user cannot log in with a missing field.
    test('does not log in with a missing password', async () => {
        const response = await supertest(app).post(`${href}/login`).send({
            email: 'user@test.ch',
        });

        expect(response.status).toBe(401);
    });
});

// Test the GET /user route
describe('GET /user', () => {
    let token;

    // Test that the user can access the /user route with a token.
    test('gets the user with a token', async () => {
        await supertest(app).post(`${href}/signup`).send({
            name: 'test.user',
            email: 'user@test.ch',
            password: '1234',
        });
        const response = await supertest(app).post(`${href}/login`).send({
            email: 'user@test.ch',
            password: '1234',
        });

        token = response.body.token;

        const userResponse = await supertest(app)
            .get(`${href}/user`)
            .set('Authorization', `Bearer ${token}`);

        expect(userResponse.status).toBe(200);
        expect(userResponse.get('Content-Type')).toContain('application/json');
        expect(userResponse.body).toMatchObject({
            _id: expect.any(String),
            name: 'test.user',
            email: 'user@test.ch',
            role: 'user',
            profilePicture: {
                url: expect.any(String),
                id: expect.any(String),
            },
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
        });
    });

    // Test that the user cannot access the /user route without a token.
    test('does not get the user without a token', async () => {
        const response = await supertest(app).get(`${href}/user`);

        expect(response.status).toBe(401);
    });
});

// Clean up leftover data in the database after testing
afterAll(disconnectDatabase);
