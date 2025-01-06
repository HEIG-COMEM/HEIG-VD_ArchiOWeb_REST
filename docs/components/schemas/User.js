export default {
    User: {
        type: 'object',
        properties: {
            _id: {
                type: 'string',
                example: '672236fc79c78a9de1e25c59',
                description: 'UUID',
            },
            name: {
                type: 'string',
                example: 'John Doe',
                description: 'Name of the user.',
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john.doe@email.com',
            },
            role: {
                type: 'string',
                example: 'user',
            },
            profilePictureUrl: {
                oneOf: [
                    {
                        type: 'string',
                        example: 'default',
                    },
                    {
                        type: 'string',
                        format: 'binary',
                    },
                ],
                description: 'Un fichier à envoyer au serveur',
            },
            createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-10-30T13:39:08.348Z',
            },
            updatedAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-10-30T13:39:08.349Z',
            },
        },
        required: [
            '_id',
            'name',
            'email',
            'role',
            'profilePictureUrl',
            'createdAt',
            'updatedAt',
        ],
    },
    UserData: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                example: 'John Doe',
                description: 'Name of the user.',
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john.doe@email.com',
            },
            password: {
                type: 'string',
                format: 'password',
            },
        },
        required: ['name', 'email', 'password'],
    },
    UserDataPut: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                example: 'John Doe',
                description: 'Name of the user.',
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john.doe@email.com',
            },
            password: {
                type: 'string',
                format: 'password',
            },
            profilePictureUrl: {
                oneOf: [
                    {
                        type: 'string',
                        example: 'default',
                    },
                    {
                        type: 'string',
                        format: 'binary',
                    },
                ],
                description: 'Un fichier à envoyer au serveur',
            },
        },
        required: ['name', 'email', 'password', 'profilePictureUrl'],
    },
    UserDataPatch: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                example: 'John Doe',
                description: 'Name of the user.',
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john.doe@email.com',
            },
            password: {
                type: 'string',
                format: 'password',
            },
            profilePictureUrl: {
                oneOf: [
                    {
                        type: 'string',
                        example: 'default',
                    },
                    {
                        type: 'string',
                        format: 'binary',
                    },
                ],
                description: 'Un fichier à envoyer au serveur',
            },
        },
    },
    UserStats: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                example: 'John Doe',
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'john.doe@email.com',
            },
            publications: {
                type: 'integer',
                example: 5,
                description: 'Number of publications',
            },
            friends: {
                type: 'integer',
                example: 3,
                description: 'Number of friends',
            },
            comments: {
                type: 'integer',
                example: 10,
                description: 'Number of comments',
            },
        },
    },
};
