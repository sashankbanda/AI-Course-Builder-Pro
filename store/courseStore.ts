
import { create } from 'zustand';
import { AppState, Course, Lesson, User, UserProgress } from '../types';
import * as courseService from '../services/courseService';
import authService from '../services/authService';
import userService from '../services/userService';

// Helper to get initial user from localStorage
const getInitialUser = (): User | null => {
  try {
    const userItem = localStorage.getItem('user');
    return userItem ? JSON.parse(userItem) : null;
  } catch (e) {
    return null;
  }
};

interface CourseState {
  appState: AppState;
  course: Course | null;
  selectedLesson: Lesson | null;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  userProgress: UserProgress;

  // Actions
  generateCourse: (topic: string) => Promise<void>;
  selectLesson: (lessonId: string) => void;
  navigateTo: (state: AppState) => void;
  resetCourse: () => void;
  completeQuiz: (lessonId: string, score: number) => void;
  login: (userData: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loadUserProgress: () => Promise<void>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  appState: getInitialUser() ? AppState.TOPIC_INPUT : AppState.AUTH_VIEW,
  course: null,
  selectedLesson: null,
  isLoading: false,
  error: null,
  user: getInitialUser(),
  userProgress: {},

  generateCourse: async (topic: string) => {
    set({ isLoading: true, error: null, appState: AppState.LOADING });
    try {
      const courseData = await courseService.generateCourse(topic);
      set({
        course: courseData,
        isLoading: false,
        appState: AppState.COURSE_VIEW,
        userProgress: {
          ...get().userProgress,
          [courseData.title]: {
            lessons: courseData.lessons.map(l => ({
              lessonId: l._id,
              completed: false,
              quizScore: null
            }))
          }
        }
      });
    } catch (err: any) {
      set({ isLoading: false, error: err.message, appState: AppState.TOPIC_INPUT });
    }
  },

  selectLesson: (lessonId: string) => {
    const course = get().course;
    if (course) {
      const lesson = course.lessons.find(l => l._id === lessonId);
      if (lesson) {
        set({ selectedLesson: lesson, appState: AppState.LESSON_VIEW });
      }
    }
  },
  
  navigateTo: (state: AppState) => {
    set({ appState: state });
  },

  resetCourse: () => {
    set({ course: null, selectedLesson: null, appState: AppState.TOPIC_INPUT, error: null });
  },

  completeQuiz: async (lessonId: string, score: number) => {
    const { course, userProgress, user } = get();
    if (!course) return;

    const newProgress = JSON.parse(JSON.stringify(userProgress)); // Deep copy
    const courseProg = newProgress[course.title];
    if (courseProg) {
      const lessonProg = courseProg.lessons.find((l: any) => l.lessonId === lessonId);
      if (lessonProg) {
        lessonProg.completed = true;
        lessonProg.quizScore = score;
      }
    }

    set({ userProgress: newProgress });

    if (user) {
      try {
        await userService.updateUserProgress({
          courseId: course._id,
          lessonId,
          quizScore: score,
        });
      } catch (error) {
        console.error("Failed to update user progress on server", error);
        // Optionally revert state or show an error to the user
      }
    }
  },

  login: async (userData) => {
    try {
      const user = await authService.login(userData);
      set({ user, appState: AppState.TOPIC_INPUT, error: null });
      get().loadUserProgress();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Login failed' });
      throw err;
    }
  },

  register: async (userData) => {
    try {
      const user = await authService.register(userData);
      set({ user, appState: AppState.TOPIC_INPUT, error: null });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Registration failed' });
      throw err;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, appState: AppState.AUTH_VIEW, course: null, userProgress: {} });
  },

  loadUserProgress: async () => {
    // This is a placeholder. A real app would fetch this from the backend.
    console.log("Loading user progress...");
  }
}));
