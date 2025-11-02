
import { Request, Response, NextFunction } from 'express';
import Progress from '../models/Progress';
import Course from '../models/Course';
import mongoose from 'mongoose';

export const getUserProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        const progress = await Progress.find({ user: req.user.id }).populate('course', 'title');
        res.status(200).json(progress);
    } catch (error) {
        next(error);
    }
};

export const updateUserProgress = async (req: Request, res: Response, next: NextFunction) => {
    const { courseId, lessonId, quizScore } = req.body;
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const course = await Course.findById(courseId);
        if(!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        let progress = await Progress.findOne({ user: req.user.id, course: courseId });

        if (!progress) {
            progress = await Progress.create({
                user: req.user.id,
                course: courseId,
                lessonProgress: [],
            });
        }
        
        const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
        const lessonProgress = progress.lessonProgress.find(lp => lp.lessonId.equals(lessonObjectId));

        if (lessonProgress) {
            lessonProgress.completed = true;
            lessonProgress.quizScore = quizScore;
        } else {
            progress.lessonProgress.push({ lessonId: lessonObjectId, completed: true, quizScore });
        }

        await progress.save();
        res.status(200).json(progress);
    } catch (error) {
        next(error);
    }
};
