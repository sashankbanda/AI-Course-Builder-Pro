
import api from './api';

const getUserProgress = async () => {
    const response = await api.get('/users/progress');
    return response.data;
};

const updateUserProgress = async (progressData: { courseId: string, lessonId: string, quizScore: number }) => {
    const response = await api.post('/users/progress', progressData);
    return response.data;
};

const userService = {
    getUserProgress,
    updateUserProgress,
};

export default userService;
