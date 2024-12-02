import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { signup, login, getUser } from '../controllers/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/user', authenticate, getUser);

export default router;
