import { faker } from '@faker-js/faker';

import Publication from '../models/publication.js';
import User from '../models/user.js';

const publications = [
    {
        frontCamera: {
            url: 'https://res.cloudinary.com/dsfssjubh/image/upload/v1732885563/isc3jukedh3keuqgx0r8.webp',
            id: 'front-camera-1',
        },
        backCamera: {
            url: 'https://res.cloudinary.com/dsfssjubh/image/upload/v1732885566/tjrsabmoxgtlpckjxokb.webp',
            id: 'back-camera-1',
        },
    },
    {
        frontCamera: {
            url: 'https://res.cloudinary.com/dsfssjubh/image/upload/v1732885555/jbe5dsij4qt9mlksosj9.webp',
            id: 'front-camera-2',
        },
        backCamera: {
            url: 'https://res.cloudinary.com/dsfssjubh/image/upload/v1732885558/gbj23ukc1m19ph1wzhmj.webp',
            id: 'back-camera-2',
        },
    },
    {
        frontCamera: {
            url: 'https://res.cloudinary.com/dsfssjubh/image/upload/v1732885548/p7uk5ioet3dx3g7aicod.webp',
            id: 'front-camera-3',
        },
        backCamera: {
            url: 'https://res.cloudinary.com/dsfssjubh/image/upload/v1732885552/zrkhc4ivlz627q4tnn3v.webp',
            id: 'back-camera-3',
        },
    },
    {
        frontCamera: {
            url: 'https://res.cloudinary.com/dsfssjubh/image/upload/v1732885548/p7uk5ioet3dx3g7aicod.webp',
            id: 'front-camera-4',
        },
        backCamera: {
            url: 'https://res.cloudinary.com/dsfssjubh/image/upload/v1732885544/hqfwigib4ypao38fpspe.webp',
            id: 'back-camera-4',
        },
    },
    {
        frontCamera: {
            url: 'https://res.cloudinary.com/dsfssjubh/image/upload/v1732885548/p7uk5ioet3dx3g7aicod.webp',
            id: 'front-camera-5',
        },
        backCamera: {
            url: 'https://res.cloudinary.com/dsfssjubh/image/upload/v1732885539/q1rgsxlmtuye1bf8pqlf.webp',
            id: 'back-camera-5',
        },
    },
];

export const seedPublications = async () => {
    const users = await User.find().limit(5);

    for (let i = 0; i < users.length; i++) {
        const publication = new Publication({
            user: users.at(i)._id,
            frontCamera: publications.at(i).frontCamera,
            backCamera: publications.at(i).backCamera,
            location: {
                type: 'Point',
                coordinates: [
                    faker.location.longitude(),
                    faker.location.latitude(),
                ],
            },
        });

        await publication.save();
    }
};
