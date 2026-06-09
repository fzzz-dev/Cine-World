import express from 'express';
import { register, login, getMe, updateBio } from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/bio', protect, updateBio);

export default router;