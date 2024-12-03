import express from 'express';

import { onlyRecipient } from '../middlewares/onlyRecipient.js';
import { findFriendById, findFriendshipById } from '../middlewares/findById.js';
import {
    getFriends,
    createFriend,
    deleteFriend,
    updateFriendStatus,
} from '../controllers/friend.js';

const router = express.Router();

router.get('/', getFriends);

router.post('/', findFriendById, createFriend);
router.delete('/:friendshipId', findFriendshipById, deleteFriend);
router.patch(
    '/:friendshipId',
    findFriendshipById,
    onlyRecipient,
    updateFriendStatus
);

export default router;
