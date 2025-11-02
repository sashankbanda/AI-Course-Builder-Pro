import express from 'express';
import { generateCourseController } from '../controllers/courseController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/generate', protect, generateCourseController);

export default router;
