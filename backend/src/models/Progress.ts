import mongoose, { Schema, Document } from 'mongoose';

interface ILessonProgress {
    lessonId: mongoose.Types.ObjectId;
    completed: boolean;
    quizScore: number | null;
}

export interface IProgress extends Document {
    user: mongoose.Types.ObjectId;
    course: mongoose.Types.ObjectId;
    lessonProgress: ILessonProgress[];
}

const LessonProgressSchema = new Schema<ILessonProgress>({
    lessonId: { type: Schema.Types.ObjectId, required: true },
    completed: { type: Boolean, default: false },
    quizScore: { type: Number, default: null },
}, { _id: false });

const ProgressSchema = new Schema<IProgress>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    course: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    lessonProgress: [LessonProgressSchema],
}, { timestamps: true });

// Ensure a user can only have one progress document per course
ProgressSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model<IProgress>('Progress', ProgressSchema);
