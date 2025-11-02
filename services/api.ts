
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    try {
      const userItem = localStorage.getItem('user');
      if (userItem) {
        const user = JSON.parse(userItem);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (e) {
      console.error("Could not parse user from localStorage", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
