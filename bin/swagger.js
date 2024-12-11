import swaggerAutogen from 'swagger-autogen';

const outputFile = './swagger_output.json';
const endpointsFiles = ['../routes/index.js'];

import * as Schemas from '../docs/components/schemas/index.js';

const doc = {
    info: {
        version: '', // by default: '1.0.0'
        title: 'BeReal Copy API',
        description:
            'This is the API documentation for the BeReal Copy API. This API is used to manage users, publications, comments, friends and more.',
    },
    servers: [
        {
            url: 'https://heig-vd-archioweb-rest.onrender.com/api/v1',
        },
    ],
    tags: [
        {
            name: 'Auth',
            description: 'Authentication management',
        },
        {
            name: 'Users',
            description: 'User management',
        },
        {
            name: 'Publications',
            description: 'Publications management',
        },
        {
            name: 'Comments',
            description: 'Comments management',
        },
        {
            name: 'Friends',
            description: 'Friends management',
        },
        {
            name: 'Admin',
            description: 'Admin management',
        },
        {
            name: 'Status',
            description: 'API status',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: Schemas,
    },
};

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
