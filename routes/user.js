import express from 'express';
import { onlyUserOrAdmin } from '../middlewares/onlyUserOrAdmin.js';
import { findUserById } from '../middlewares/findById.js';
import { loadUserImage } from '../controllers/upload.js';
import * as cdn from '../middlewares/cdn.js';

import {
    getUsers,
    getUser,
    updateUser,
    updateUserData,
    deleteUser,
} from '../controllers/user.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', findUserById, getUser);
router.put(
    '/:id',
    findUserById,
    onlyUserOrAdmin,
    loadUserImage,
    cdn.uploadUserImage,
    updateUser
);
router.patch(
    '/:id',
    findUserById,
    onlyUserOrAdmin,
    loadUserImage,
    cdn.uploadUserImage,
    updateUserData
);
router.delete('/:id', findUserById, onlyUserOrAdmin, deleteUser);

export default router;
