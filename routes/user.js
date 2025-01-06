import express from 'express';
import { onlyUserOrAdmin } from '../middlewares/onlyUserOrAdmin.js';
import { findUserById } from '../middlewares/findById.js';
import { loadUserImage } from '../controllers/upload.js';
import * as cdn from '../middlewares/cdn.js';

import {
    getUsers,
    getUser,
    getUserStats,
    updateUser,
    updateUserData,
    deleteUser,
} from '../controllers/user.js';

const router = express.Router();

router.get(
    '/',
    getUsers
    /*
    #swagger.description = 'Get all users.'
    #swagger.responses[200] = {
        description: 'List of users.',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: {
                        $ref: '#/components/schemas/User/User'
                    }
                }
            }
        }
    }
    */
);
router.get(
    '/:id',
    findUserById,
    getUser
    /*
    #swagger.description = 'Get a user.'
    #swagger.responses[200] = {
        description: 'The user is found.',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/User/User'
                }
            }
        }
    }
    */
);
router.get(
    '/:id/stats',
    findUserById,
    getUserStats
    /*
    #swagger.description = 'Get the statistics of a user.'
    #swagger.responses[200] = {
        description: 'The statistics of the user.',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/User/UserStats'
                }
            }
        }
    }
    */
);
router.put(
    '/:id',
    findUserById,
    onlyUserOrAdmin,
    loadUserImage,
    cdn.uploadUserImage,
    updateUser
    /*
    #swagger.description = 'Update a user.'
    #swagger.requestBody = {
        required: true,
        schema: { $ref: '#/components/schemas/User/UserDataPut' }
    }
    #swagger.responses[200] = {
        description: 'The user is updated.',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/User/User'
                }
            }
        }
    }
    */
);
router.patch(
    '/:id',
    findUserById,
    onlyUserOrAdmin,
    loadUserImage,
    cdn.uploadUserImage,
    updateUserData
    /*
    #swagger.description = 'Update a user.'
    #swagger.requestBody = {
        required: true,
        schema: { $ref: '#/components/schemas/User/UserDataPatch' }
    }
    #swagger.responses[200] = {
        description: 'The user is updated.',
        content: {
            'application/json': {
                schema: {
                    $ref: '#/components/schemas/User/User'
                }
            }
        }
    }
    */
);
router.delete('/:id', findUserById, onlyUserOrAdmin, deleteUser);

export default router;
