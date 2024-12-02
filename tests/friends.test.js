import supertest from 'supertest';

import app from '../app.js';
import {
    cleanUpDatabase,
    createRandomUser,
    disconnectDatabase,
    generateValidJwt,
    createFriendship,
} from './utils/utils.js';
import { fr } from '@faker-js/faker';

// Clean up leftover data in the database before starting to test
beforeEach(cleanUpDatabase);

const href = `/api/v1/friends`;

let user;
let userJwt;
let friends;
let pendingFriends;
let pendingUsers;
let friendships;

// Create accepted and pending friendships as well as pending users
beforeEach(async () => {
    user = await createRandomUser().save();
    userJwt = await generateValidJwt(user);
    friends = [
        // ppl who the user is friends with
        await createRandomUser().save(),
        await createRandomUser().save(),
        await createRandomUser().save(),
        await createRandomUser().save(),
        await createRandomUser().save(),
    ];
    pendingFriends = [
        // ppl who the user has sent a friend request to
        await createRandomUser().save(),
        await createRandomUser().save(),
    ];
    pendingUsers = [
        // ppl who have sent a friend request to the user
        await createRandomUser().save(),
    ];

    friendships = [
        ...(await Promise.all(
            friends.map((friend) => createFriendship(user, friend, 'accepted'))
        )),
        ...(await Promise.all(
            pendingFriends.map((friend) => createFriendship(user, friend))
        )),
        ...(await Promise.all(
            pendingUsers.map((friend) => createFriendship(friend, user))
        )),
    ];
});

describe('GET /friends', () => {
    test('test that the user can see all friendships', async () => {
        const response = await supertest(app)
            .get(`${href}`)
            .set('Authorization', `Bearer ${userJwt}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(
            friendships.length - pendingFriends.length
        );
    });

    test('test that the user can see only accepted friendships', async () => {
        const response = await supertest(app)
            .get(`${href}?status=accepted`)
            .set('Authorization', `Bearer ${userJwt}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(friends.length);
    });

    test('test that the user can see only pending friendships', async () => {
        const response = await supertest(app)
            .get(`${href}?status=pending`)
            .set('Authorization', `Bearer ${userJwt}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(friendships.length - friends.length);
    });
});

afterAll(disconnectDatabase);
