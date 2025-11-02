// These types represent the structure of data after being retrieved from MongoDB
// or before being sent to the frontend.

export interface QuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Lesson {
  _id: string; // Mongoose subdocuments always have an _id
  title: string;
  videoUrl: string;
  notes: string;
  quiz: QuizQuestion[];
}

export interface Course {
  _id?: string;
  topic: string;
  title:string;
  lessons: Lesson[];
  finalQuiz: QuizQuestion[];
}
