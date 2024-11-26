import supertest from 'supertest';

import app from '../app.js';
import {
    cleanUpDatabase,
    createRandomUser,
    createRandomUsers,
    disconnectDatabase,
    generateValidJwt,
} from './utils/utils.js';
import { de, ro } from '@faker-js/faker';
import e from 'express';
import { pass } from 'jest-extended';

// Clean up leftover data in the database before starting to test
beforeEach(cleanUpDatabase);

const href = `/api/v1/users`;

// describe('User', () => {
//     Test that all users can be retrieved
//     This test doesn't take into account the order of the users
//     test('GET /', async () => {
//         const response = await supertest(app).get(`${href}/`);
//         expect(response.status).toBe(200);
//         expect(response.get('Content-Type')).toContain('application/json');
//         expect(response.body).toMatchObject([]);

//         const userCount = 5;
//         const users = createRandomUsers(userCount);
//         await Promise.all(users.map((user) => user.save()));

//         const response2 = await supertest(app).get(`${href}/`);
//         expect(response2.status).toBe(200);
//         expect(response2.get('Content-Type')).toContain('application/json');

//         expect(response2.body).toHaveLength(userCount);
//         compare the response body with the users array (dont take into account the order)
//         expect(response2.body).toEqual(
//             expect.arrayContaining(
//                 users.map((user) =>
//                     expect.objectContaining({
//                         _id: user._id.toString(),
//                         name: user.name,
//                         email: user.email,
//                         profilePictureUrl: user.profilePictureUrl,
//                         createdAt: user.createdAt.toISOString(),
//                         updatedAt: user.updatedAt.toISOString(),
//                     })
//                 )
//             )
//         );
//     });

//     Test that a user can be retrieved by ID
//     test('GET /:id', async () => {
//         const user = createRandomUser();
//         await user.save();

//         const response = await supertest(app).get(
//             `${href}/${user._id.toString()}`
//         );
//         expect(response.status).toBe(200);
//         expect(response.get('Content-Type')).toContain('application/json');
//         expect(response.body).toMatchObject({
//             _id: user._id.toString(),
//             name: user.name,
//             email: user.email,
//             profilePictureUrl: user.profilePictureUrl,
//             createdAt: user.createdAt.toISOString(),
//             updatedAt: user.updatedAt.toISOString(),
//         });
//     });
// });

describe('GET /users', () => {
    //before each create 2 users
    let user1;
    let user2;
    beforeEach(async () => {
        user1 = await createRandomUser().save();
        user2 = await createRandomUser().save();
    });

    // Test that all users can be retrieved
    test('should return 200 and all users', async () => {
        const jwt = await generateValidJwt(user1);
        const response = await supertest(app)
            .get(`${href}`)
            .set('Authorization', `Bearer ${jwt}`);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject([
            expect.objectContaining({
                __v: expect.any(Number),
                _id: user1._id.toString(),
                name: user1.name,
                email: user1.email,
                profilePictureUrl: user1.profilePictureUrl,
                role: user1.role,
                createdAt: user1.createdAt.toISOString(),
                updatedAt: user1.updatedAt.toISOString(),
            }),
            expect.objectContaining({
                __v: expect.any(Number),
                _id: user2._id.toString(),
                name: user2.name,
                email: user2.email,
                profilePictureUrl: user2.profilePictureUrl,
                role: user2.role,
                createdAt: user2.createdAt.toISOString(),
                updatedAt: user2.updatedAt.toISOString(),
            }),
        ]);
    });

    // Test return 401 if the user is not authenticated
    test('should return 401 if the user is not authenticated', async () => {
        const response = await supertest(app).get(`${href}`);
        expect(response.status).toBe(401);
    });
});

describe('GET /users/:id', () => {
    //before each create 2 users
    let user1;
    let user2;
    beforeEach(async () => {
        user1 = await createRandomUser().save();
        user2 = await createRandomUser().save();
    });

    // Test that a user can be retrieved by ID
    test('should return 200 and the user', async () => {
        const jwt = await generateValidJwt(user1);
        const response = await supertest(app)
            .get(`${href}/${user1._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            __v: expect.any(Number),
            _id: user1._id.toString(),
            name: user1.name,
            email: user1.email,
            profilePictureUrl: user1.profilePictureUrl,
            role: user1.role,
            createdAt: user1.createdAt.toISOString(),
            updatedAt: user1.updatedAt.toISOString(),
        });
    });

    // Test of the return 400 if the user id is invalid
    test('should return 400 if the user id is invalid (TEST of the middleware "findUserById")', async () => {
        const jwt = await generateValidJwt(user1);
        const invalidId = 'invalidId';
        const response = await supertest(app)
            .get(`${href}/${invalidId}`)
            .set('Authorization', `Bearer ${jwt}`);
        expect(response.status).toBe(400);
        expect(response.text).toBe(`ID ${invalidId} is not valid.`);
    });

    // Test of the return 404 if the user is not found
    test('should return 404 if the user is not found (TEST of the middleware "findUserById")', async () => {
        const jwt = await generateValidJwt(user1);
        const falseId = '000000000000000000000000';
        const response = await supertest(app)
            .get(`${href}/${falseId}`)
            .set('Authorization', `Bearer ${jwt}`);
        expect(response.status).toBe(404);
        expect(response.text).toBe(`No user found with ID ${falseId}.`);
    });

    // Test return 401 if the user is not authenticated
    test('should return 401 if the user is not authenticated', async () => {
        const response = await supertest(app).get(
            `${href}/${user1._id.toString()}`
        );
        expect(response.status).toBe(401);
        expect(response.text).toBe('Authorization header is missing.');
    });
});

describe('PUT /users', () => {
    //before each create 2 users, one as an admin and one as a user
    let adminUser;
    let user;
    beforeEach(async () => {
        adminUser = await createRandomUser({ role: 'admin' }).save();
        user = await createRandomUser().save();
    });

    // Test that a user can be updated
    test('put by admin should return 200 and the updated user', async () => {
        const adminJwt = await generateValidJwt(adminUser);
        const response = await supertest(app)
            .put(`${href}/${user._id.toString()}`)
            .set('Authorization', `Bearer ${adminJwt}`)
            .send({
                name: 'new.name.by.admin',
                email: 'user@by.admin',
                password: 'adminpassword',
                profilePictureUrl: 'http://change.by.admin/image.jpg',
            });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            __v: expect.any(Number),
            _id: user._id.toString(),
            name: 'new.name.by.admin',
            email: 'user@by.admin',
            profilePictureUrl: 'http://change.by.admin/image.jpg',
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: expect.any(String),
        });
    });

    // Test that a user can be updated by the user itself
    test('put by user should return 200 and the updated user', async () => {
        const jwt = await generateValidJwt(user);
        const response = await supertest(app)
            .put(`${href}/${user._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                name: 'new.name.by.user',
                email: 'user@by.user',
                password: 'userpassword',
                profilePictureUrl: 'http://change.by.user/image.jpg',
            });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            __v: expect.any(Number),
            _id: user._id.toString(),
            name: 'new.name.by.user',
            email: 'user@by.user',
            profilePictureUrl: 'http://change.by.user/image.jpg',
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: expect.any(String),
        });
    });

    // Test to updtae the user with missing fields
    test('should return 400 if not all fields are provided', async () => {
        const jwt = await generateValidJwt(user);
        const response = await supertest(app)
            .put(`${href}/${user._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                name: 'only.name',
            });
        expect(response.status).toBe(400);
        expect(response.text).toBe(
            'Fields name, password and email are required'
        );
    });

    // Test to update the user with an invalid email and name
    test('should return 422 with details if some fields are invalid', async () => {
        const jwt = await generateValidJwt(user);
        const response = await supertest(app)
            .put(`${href}/${user._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                name: 'New Name',
                email: 'invalidemail',
                password: 'password',
            });
        expect(response.status).toBe(422);
        expect(response.body).toContainKeys(['message']);
    });

    // Test that a user can't be updated by a user that is not the user itself or an admin
    test('should return 403 if the user is not the user itself or an admin', async () => {
        const jwt = await generateValidJwt(user);
        const response = await supertest(app)
            .put(`${href}/${adminUser._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                name: 'update.name',
                email: 'email@test.test',
                password: 'password',
            });
        expect(response.status).toBe(403);
        expect(response.text).toBe(
            'You are not authorized to perform this action.'
        );
    });

    // Test of the return 400 if the user id is invalid
    test('should return 400 if the user id is invalid', async () => {
        const jwt = await generateValidJwt(user);
        const invalidId = 'invalidId';
        const response = await supertest(app)
            .put(`${href}/${invalidId}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                name: 'update.name',
                email: 'email@test.test',
                password: 'password',
            });
        expect(response.status).toBe(400);
        expect(response.text).toBe(`ID ${invalidId} is not valid.`);
    });

    // Test of the return 404 if the user is not found
    test('should return 404 if the user is not found', async () => {
        const jwt = await generateValidJwt(user);
        const falseId = '000000000000000000000000';
        const response = await supertest(app)
            .put(`${href}/${falseId}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                name: 'new.name.by.user',
                email: 'user@by.user',
                password: 'userpassword',
                profilePictureUrl: 'http://change.by.user/image.jpg',
            });
        expect(response.status).toBe(404);
        expect(response.text).toBe(`No user found with ID ${falseId}.`);
    });

    // Test return 401 if the user is not authenticated
    test('should return 401 if the user is not authenticated', async () => {
        const response = await supertest(app)
            .put(`${href}/${user._id.toString()}`)
            .send({
                name: 'new.name.by.user',
                email: 'user@by.user',
                password: 'userpassword',
                profilePictureUrl: 'http://change.by.user/image.jpg',
            });
        expect(response.status).toBe(401);
        expect(response.text).toBe('Authorization header is missing.');
    });
});

describe('PATCH /users', () => {
    //before each create 2 users, one as an admin and one as a user
    let adminUser;
    let user;
    beforeEach(async () => {
        adminUser = await createRandomUser({ role: 'admin' }).save();
        user = await createRandomUser().save();
    });

    // Test that a user can be updated
    test('patch by admin should return 200 and the updated user', async () => {
        const adminJwt = await generateValidJwt(adminUser);
        const response = await supertest(app)
            .patch(`${href}/${user._id.toString()}`)
            .set('Authorization', `Bearer ${adminJwt}`)
            .send({
                name: 'new.name.by.admin',
            });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            __v: expect.any(Number),
            _id: user._id.toString(),
            name: 'new.name.by.admin',
            email: user.email,
            profilePictureUrl: user.profilePictureUrl,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: expect.any(String),
        });
    });

    // Test that a user can be updated by the user itself
    test('patch by user on himself should return 200 and the updated user', async () => {
        const jwt = await generateValidJwt(user);
        const response = await supertest(app)
            .patch(`${href}/${user._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                email: 'b@b.al',
            });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            __v: expect.any(Number),
            _id: user._id.toString(),
            name: user.name,
            email: 'b@b.al',
            profilePictureUrl: user.profilePictureUrl,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: expect.any(String),
        });
    });

    // Test to update an other user without being an admin
    test('should return 403 if the user is not the user itself or an admin', async () => {
        const jwt = await generateValidJwt(user);
        const response = await supertest(app)
            .patch(`${href}/${adminUser._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                name: 'new.name',
            });
        expect(response.status).toBe(403);
        expect(response.text).toBe(
            'You are not authorized to perform this action.'
        );
    });

    // 4 tests to update each field of the user
    // Test to update the name of the user
    test('should return 200 and the updated user if the name is updated', async () => {
        const jwt = await generateValidJwt(user);
        const response = await supertest(app)
            .patch(`${href}/${user._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                name: 'new.name',
            });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            __v: expect.any(Number),
            _id: user._id.toString(),
            name: 'new.name',
            email: user.email,
            profilePictureUrl: user.profilePictureUrl,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: expect.any(String),
        });
    });

    // Test to update the email of the user
    test('should return 200 and the updated user if the email is updated', async () => {
        const jwt = await generateValidJwt(user);
        const response = await supertest(app)
            .patch(`${href}/${user._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                email: 'c@c.com',
            });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            __v: expect.any(Number),
            _id: user._id.toString(),
            name: user.name,
            email: 'c@c.com',
            profilePictureUrl: user.profilePictureUrl,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: expect.any(String),
        });
    });

    // Test to update the password of the user
    test('should return 200 and the updated user if the password is updated', async () => {
        const jwt = await generateValidJwt(user);
        const response = await supertest(app)
            .patch(`${href}/${user._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                password: 'newpassword',
            });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            __v: expect.any(Number),
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            profilePictureUrl: user.profilePictureUrl,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: expect.any(String),
        });
    });

    // Test to update the profilePictureUrl of the user
    test('should return 200 and the updated user if the profilePictureUrl is updated', async () => {
        const jwt = await generateValidJwt(user);
        const response = await supertest(app)
            .patch(`${href}/${user._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                profilePictureUrl: 'http://new.image.jpg',
            });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            __v: expect.any(Number),
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            profilePictureUrl: 'http://new.image.jpg',
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: expect.any(String),
        });
    });

    // Test validation of a field
    test('should return 422 if the email is invalid', async () => {
        const jwt = await generateValidJwt(user);
        const response = await supertest(app)
            .patch(`${href}/${user._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                email: 'invalidemail',
            });
        expect(response.status).toBe(422);
        expect(response.body).toContainKeys(['message']);
    });

    test.todo(
        'Is there a need to test the fields passed in the request? Like if the user sends a field that is not in the schema?'
    );
});

describe('DELETE /users', () => {
    //before each create 4 users, one as an admin and one as a user
    let adminUser1;
    let adminUser2;
    let user1;
    let user2;
    beforeEach(async () => {
        adminUser1 = await createRandomUser({ role: 'admin' }).save();
        adminUser2 = await createRandomUser({ role: 'admin' }).save();
        user1 = await createRandomUser().save();
        user2 = await createRandomUser().save();
    });

    // Test that a user can be deleted by an admin
    test('delete by admin should return 204', async () => {
        const adminJwt = await generateValidJwt(adminUser1);
        const response = await supertest(app)
            .delete(`${href}/${user1._id.toString()}`)
            .set('Authorization', `Bearer ${adminJwt}`);
        expect(response.status).toBe(204);
        expect(response.body).toBeEmpty();
    });

    // Test that an admin can't delete another admin
    test('delete an admin by an admin should return 204 and operation should be successful', async () => {
        const adminJwt = await generateValidJwt(adminUser1);
        const response = await supertest(app)
            .delete(`${href}/${adminUser2._id.toString()}`)
            .set('Authorization', `Bearer ${adminJwt}`);
        expect(response.status).toBe(204);
        expect(response.body).toBeEmpty();
    });

    // Test that a user can be deleted by the user itself
    test('delete by user should return 204', async () => {
        const jwt = await generateValidJwt(user1);
        const response = await supertest(app)
            .delete(`${href}/${user1._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`);
        expect(response.status).toBe(204);
        expect(response.body).toBeEmpty();
    });

    // Test that a user can't be deleted by a user that is not the user itself or an admin
    test('should return 403 if the user is not the user itself or an admin', async () => {
        const jwt = await generateValidJwt(user1);
        const response = await supertest(app)
            .delete(`${href}/${adminUser1._id.toString()}`)
            .set('Authorization', `Bearer ${jwt}`);
        expect(response.status).toBe(403);
        expect(response.text).toBe(
            'You are not authorized to perform this action.'
        );
    });
});

afterAll(disconnectDatabase);
