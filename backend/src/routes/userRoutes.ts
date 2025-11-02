
import express from 'express';
import { getUserProgress, updateUserProgress } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/progress').get(protect, getUserProgress).post(protect, updateUserProgress);

export default router;
