import express from 'express';

import { onlyRecipient } from '../middlewares/onlyRecipient.js';
import { findFriendById } from '../middlewares/findById.js';
import {
    getFriends,
    createFriend,
    deleteFriend,
    updateFriendStatus,
} from '../controllers/friend.js';

const router = express.Router();

router.get('/', getFriends);

router.post('/', findFriendById, createFriend);
router.delete('/:friendshipId', deleteFriend);
router.patch('/:friendshipId', onlyRecipient, updateFriendStatus);

export default router;
