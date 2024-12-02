import supertest from 'supertest';
import {
    createRandomPublication,
    createRandomUser,
    generateValidJwt,
    createRandomComment,
} from './utils/utils.js';

import app from '../app.js';
import { cleanUpDatabase, disconnectDatabase } from './utils/utils.js';

// Clean up leftover data in the database before starting to test
beforeEach(cleanUpDatabase);

describe('Comment', () => {
    // Setup a test user and a test publication
    let user;
    let userJwt;
    let publication;

    beforeEach(async () => {
        // Fixtures
        user = await createRandomUser().save();
        userJwt = await generateValidJwt(user);
        publication = await createRandomPublication(user).save();
    });

    describe('GET /publications/:id/comments/', () => {
        test('Should get all comments of a publication', async () => {
            const comm1 = await createRandomComment(user, publication).save();
            const comm2 = await createRandomComment(user, publication).save();
            const comm3 = await createRandomComment(user, publication).save();

            const response = await supertest(app)
                .get(`/api/v1/publications/${publication._id}/comments/`)
                .set('Authorization', `Bearer ${userJwt}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(3);
            expect(response.body).toMatchObject([
                {
                    _id: comm1._id.toString(),
                    content: comm1.content,
                    user: expect.any(Object),
                    publication: publication._id.toString(),
                    createdAt: comm1.createdAt.toISOString(),
                    updatedAt: comm1.updatedAt.toISOString(),
                },
                {
                    _id: comm2._id.toString(),
                    content: comm2.content,
                    user: expect.any(Object),
                    publication: publication._id.toString(),
                    createdAt: comm2.createdAt.toISOString(),
                    updatedAt: comm2.updatedAt.toISOString(),
                },
                {
                    _id: comm3._id.toString(),
                    content: comm3.content,
                    user: expect.any(Object),
                    publication: publication._id.toString(),
                    createdAt: comm3.createdAt.toISOString(),
                    updatedAt: comm3.updatedAt.toISOString(),
                },
            ]);
        });

        test('Should get a comment by id', async () => {
            const comm = await createRandomComment(user, publication).save();

            const response = await supertest(app)
                .get(
                    `/api/v1/publications/${publication._id}/comments/${comm._id}`
                )
                .set('Authorization', `Bearer ${userJwt}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                _id: comm._id.toString(),
                content: comm.content,
                user: expect.any(Object),
                publication: publication._id.toString(),
                createdAt: comm.createdAt.toISOString(),
                updatedAt: comm.updatedAt.toISOString(),
            });
        });

        test('Should fail to get a comment by id if it does not exist', async () => {
            const response = await supertest(app)
                .get(
                    `/api/v1/publications/${publication._id}/comments/60b5b8e3e4f0f5e5b4e1d1f4`
                )
                .set('Authorization', `Bearer ${userJwt}`);

            expect(response.status).toBe(404);
        });

        test('Should fail to get a comment by id if it does not belong to the publication', async () => {
            const comm = await createRandomComment(user, publication).save();
            const anotherPublication =
                await createRandomPublication(user).save();

            const response = await supertest(app)
                .get(
                    `/api/v1/publications/${anotherPublication._id}/comments/${comm._id}`
                )
                .set('Authorization', `Bearer ${userJwt}`);

            expect(response.status).toBe(404);
        });

        test('Should fail to get a comment by id without being authenticated', async () => {
            const comm = await createRandomComment(user, publication).save();

            const response = await supertest(app).get(
                `/api/v1/publications/${publication._id}/comments/${comm._id}`
            );

            expect(response.status).toBe(401);
        });
    });

    describe('POST /publications/:id/comments/', () => {
        test('Should create a comment', async () => {
            const response = await supertest(app)
                .post(`/api/v1/publications/${publication._id}/comments/`)
                .set('Authorization', `Bearer ${userJwt}`)
                .send({
                    content: 'This is a comment',
                });

            expect(response.status).toBe(201);
            expect(response.get('Content-Type')).toContain('application/json');
            expect(response.body).toMatchObject({
                _id: expect.any(String),
                content: 'This is a comment',
                user: user._id.toString(),
                publication: publication._id.toString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
        });

        test('Should create a reply to a comment', async () => {
            const initialComment = await createRandomComment(
                user,
                publication
            ).save();

            const response = await supertest(app)
                .post(`/api/v1/publications/${publication._id}/comments/`)
                .set('Authorization', `Bearer ${userJwt}`)
                .send({
                    content: 'This is a reply',
                    parentComment: initialComment._id,
                });

            expect(response.status).toBe(201);
            expect(response.get('Content-Type')).toContain('application/json');
            expect(response.body).toMatchObject({
                _id: expect.any(String),
                content: 'This is a reply',
                user: user._id.toString(),
                publication: publication._id.toString(),
                parentComment: initialComment._id.toString(),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
        });

        test('Should fail to create a comment with an invalid publication id', async () => {
            const response = await supertest(app)
                .post(`/api/v1/publications/60b5b8e3e4f0f5e5b4e1d1f4/comments/`)
                .set('Authorization', `Bearer ${userJwt}`)
                .send({
                    content: 'This is a comment',
                });

            expect(response.status).toBe(404);
        });

        test('Should fail to create a comment without content', async () => {
            const response = await supertest(app)
                .post(`/api/v1/publications/${publication._id}/comments/`)
                .set('Authorization', `Bearer ${userJwt}`)
                .send({});

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('message');
        });

        test('Should fail to create a comment without being authenticated', async () => {
            const response = await supertest(app)
                .post(`/api/v1/publications/${publication._id}/comments/`)
                .send({
                    content: 'This is a comment',
                });

            expect(response.status).toBe(401);
        });

        test('Should fail to create a comment with an invalid parent comment', async () => {
            const response = await supertest(app)
                .post(`/api/v1/publications/${publication._id}/comments/`)
                .set('Authorization', `Bearer ${userJwt}`)
                .send({
                    content: 'This is a comment',
                    parentComment: '60b5b8e3e4f0f5e5b4e1d1f4',
                });

            expect(response.status).toBe(404);
        });

        test('Should fail to create a comment to a non-existing publication', async () => {
            const response = await supertest(app)
                .post(`/api/v1/publications/60b5b8e3e4f0f5e5b4e1d1f4/comments/`)
                .set('Authorization', `Bearer ${userJwt}`)
                .send({
                    content: 'This is a comment',
                });

            expect(response.status).toBe(404);
        });

        test('Should fail to create a reply to a non-existing comment', async () => {
            const response = await supertest(app)
                .post(`/api/v1/publications/${publication._id}/comments/`)
                .set('Authorization', `Bearer ${userJwt}`)
                .send({
                    content: 'This is a reply',
                    parentComment: '60b5b8e3e4f0f5e5b4e1d1f4',
                });

            expect(response.status).toBe(404);
        });

        test('Should fail to create a reply to a comment that does not belong to the publication', async () => {
            const initialComment = await createRandomComment(
                user,
                publication
            ).save();
            const anotherPublication =
                await createRandomPublication(user).save();

            const response = await supertest(app)
                .post(
                    `/api/v1/publications/${anotherPublication._id}/comments/`
                )
                .set('Authorization', `Bearer ${userJwt}`)
                .send({
                    content: 'This is a reply',
                    parentComment: initialComment._id,
                });

            expect(response.status).toBe(422);
        });
    });

    describe('DELETE /publications/:id/comments/:commentId', () => {
        test('Should delete the comment', async () => {
            const initialComment = await createRandomComment(
                user,
                publication
            ).save();
            // Delete the initial comment
            // The response status should be 204
            const response = await supertest(app)
                .delete(
                    `/api/v1/publications/${publication._id}/comments/${initialComment._id}`
                )
                .set('Authorization', `Bearer ${userJwt}`);
            expect(response.status).toBe(204);
        });

        test('Should fail to get the reply to a deleted comment', async () => {
            const initialComment = await createRandomComment(
                user,
                publication
            ).save();
            const reply = await createRandomComment(
                user,
                publication,
                initialComment
            ).save();

            // Delete the initial comment
            // The response status should be 204
            const response = await supertest(app)
                .delete(
                    `/api/v1/publications/${publication._id}/comments/${initialComment._id}`
                )
                .set('Authorization', `Bearer ${userJwt}`);
            expect(response.status).toBe(204);

            // Try to get the reply to the deleted comment
            // The response status should be 404
            const response2 = await supertest(app)
                .get(
                    `/api/v1/publications/${publication._id}/comments/${reply._id}`
                )
                .set('Authorization', `Bearer ${userJwt}`);
            expect(response2.status).toBe(404);
        });

        test('Should fail to delete a comment that does not exist', async () => {
            const response = await supertest(app)
                .delete(
                    `/api/v1/publications/${publication._id}/comments/60b5b8e3e4f0f5e5b4e1d1f4`
                )
                .set('Authorization', `Bearer ${userJwt}`);
            expect(response.status).toBe(404);
        });

        test('Should fail to delete a comment that does not belong to the user', async () => {
            const initialComment = await createRandomComment(
                user,
                publication
            ).save();
            const anotherUser = await createRandomUser().save();
            const anotherUserJwt = await generateValidJwt(anotherUser);

            const response = await supertest(app)
                .delete(
                    `/api/v1/publications/${publication._id}/comments/${initialComment._id}`
                )
                .set('Authorization', `Bearer ${anotherUserJwt}`);
            expect(response.status).toBe(403);
        });
    });
});

afterAll(disconnectDatabase);
