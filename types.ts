
export enum AppState {
  TOPIC_INPUT,
  LOADING,
  COURSE_VIEW,
  LESSON_VIEW,
  DASHBOARD_VIEW,
  AUTH_VIEW,
}

export interface QuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Lesson {
  _id: string;
  title: string;
  videoUrl: string;
  notes: string;
  quiz: QuizQuestion[];
}

export interface Course {
  _id: string;
  topic: string;
  title: string;
  lessons: Lesson[];
  finalQuiz: QuizQuestion[];
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  quizScore: number | null;
}

export interface CourseProgress {
  lessons: LessonProgress[];
}

export interface UserProgress {
  [courseTitle: string]: CourseProgress;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}
