import { Request, Response, NextFunction } from 'express';
import { generateFullCourse } from '../services/courseGenerationService';

export const generateCourseController = async (req: Request, res: Response, next: NextFunction) => {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string') {
        return res.status(400).json({ message: 'Topic is required and must be a string.' });
    }

    try {
        const course = await generateFullCourse(topic);
        res.status(200).json(course);
    } catch (error) {
        console.error('Error in course generation controller:', error);
        next(error); // Pass error to the central error handler
    }
};
