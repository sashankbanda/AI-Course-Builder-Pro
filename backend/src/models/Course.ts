import mongoose, { Schema, Document } from 'mongoose';
import { Course as ICourse, Lesson as ILesson, QuizQuestion as IQuizQuestion } from '../types';

const QuizQuestionSchema = new Schema<IQuizQuestion>({
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
});

const LessonSchema = new Schema<ILesson>({
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    notes: { type: String, required: true },
    quiz: [QuizQuestionSchema],
});

const CourseSchema = new Schema<ICourse & Document>({
    topic: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    lessons: [LessonSchema],
    finalQuiz: [QuizQuestionSchema],
}, { timestamps: true });

export default mongoose.model<ICourse & Document>('Course', CourseSchema);
