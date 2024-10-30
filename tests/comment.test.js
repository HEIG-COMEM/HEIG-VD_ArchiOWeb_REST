import mongoose from 'mongoose';
import supertest from 'supertest';
import path from 'path';

import app from '../app.js';
import { cleanUpDatabase } from './utils/utils.js';

// Clean up leftover data in the database before starting to test
beforeAll(cleanUpDatabase);

describe('Comment', () => {
    // Setup a test user and a test publication
    let user;
    let publication;
    let token;
    let initialComment;
    let reply;

    it('Should create a user and log him in', async () => {
        const response = await supertest(app).post(`/api/v1/auth/signup`).send({
            name: 'Test User',
            email: 'testuser@gmail.com',
            password: '1234',
        });

        user = response.body;

        const response2 = await supertest(app).post(`/api/v1/auth/login`).send({
            email: 'testuser@gmail.com',
            password: '1234',
        });

        token = response2.body.token;

        expect(response2.status).toBe(200);
        expect(response2.get('Content-Type')).toContain('application/json');
        expect(response2.body).toMatchObject({
            token: expect.any(String),
        });
    });

    it('Should create a publication', async () => {
        const response = await supertest(app)
            .post(`/api/v1/publications`)
            .set('Authorization', `Bearer ${token}`)
            .attach(
                'frontCamera',
                path.resolve('tests/utils/img/test-front.jpeg')
            )
            .attach(
                'backCamera',
                path.resolve('tests/utils/img/test-back.jpg')
            );

        publication = response.body;

        expect(response.status).toBe(201);
        expect(response.get('Content-Type')).toContain('application/json');
        expect(response.body).toMatchObject({
            _id: expect.any(String),
            frontCamera: expect.objectContaining({ path: expect.any(String) }),
            backCamera: expect.objectContaining({ path: expect.any(String) }),
            user: user._id,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
        });
    });

    describe('POST /publications/:id/comments/', () => {
        it('Should create a comment', async () => {
            const response = await supertest(app)
                .post(`/api/v1/publications/${publication._id}/comments/`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    content: 'This is a comment',
                });

            initialComment = response.body;

            expect(response.status).toBe(201);
            expect(response.get('Content-Type')).toContain('application/json');
            expect(initialComment).toMatchObject({
                _id: expect.any(String),
                content: 'This is a comment',
                user: user._id,
                publication: publication._id,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
        });

        it('Should create a reply to the comment', async () => {
            const response = await supertest(app)
                .post(`/api/v1/publications/${publication._id}/comments/`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    content: 'This is a reply',
                    parentComment: initialComment._id,
                });

            reply = response.body;

            expect(response.status).toBe(201);
            expect(response.get('Content-Type')).toContain('application/json');
            expect(reply).toMatchObject({
                _id: expect.any(String),
                content: 'This is a reply',
                user: user._id,
                publication: publication._id,
                parentComment: initialComment._id,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
        });
    });

    describe('DELETE /publications/:id/comments/:commentId', () => {
        it('Should delete the initial comment', async () => {
            // Delete the initial comment
            // The response status should be 204
            const response = await supertest(app)
                .delete(
                    `/api/v1/publications/${publication._id}/comments/${initialComment._id}`
                )
                .set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(204);
        });

        it('Should fail to get the reply to the deleted comment', async () => {
            // Check if the comment and its replies are deleted
            // We check that the reply is deleted thus the response status should be 404
            const response2 = await supertest(app)
                .get(
                    `/api/v1/publications/${publication._id}/comments/${reply._id}`
                )
                .set('Authorization', `Bearer ${token}`);
            expect(response2.status).toBe(404);
        });
    });
});

afterAll(cleanUpDatabase);
