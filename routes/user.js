import express from 'express';
import { onlyUserOrAdmin } from '../middlewares/onlyUserOrAdmin.js';

import {
    getUsers,
    getUser,
    updateUser,
    updateUserData,
    deleteUser,
} from '../controllers/user.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', onlyUserOrAdmin, updateUser);
router.patch('/:id', onlyUserOrAdmin, updateUserData);
router.delete('/:id', onlyUserOrAdmin, deleteUser);

export default router;
