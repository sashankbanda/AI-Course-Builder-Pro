
import api from './api';
import { Course } from '../types';

export const generateCourse = async (topic: string): Promise<Course> => {
    const response = await api.post('/courses/generate', { topic });
    return response.data;
};
