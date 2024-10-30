import express from 'express';

import {
    getFriends,
    createFriend,
    deleteFriend,
} from '../controllers/friend.js';

const router = express.Router();

router.get('/', getFriends);
router.post('/', createFriend);
router.delete('/:friendId', deleteFriend);

export default router;
