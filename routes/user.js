import express from 'express';
import { onlyUserOrAdmin } from '../middlewares/onlyUserOrAdmin.js';
import { findUserById } from '../middlewares/findById.js';

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
router.put('/:id', findUserById, onlyUserOrAdmin, updateUser);
router.patch('/:id', findUserById, onlyUserOrAdmin, updateUserData);
router.delete('/:id', findUserById, onlyUserOrAdmin, deleteUser);

export default router;
