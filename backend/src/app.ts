
import express from 'express';
import cors from 'cors';
import { errorHandler } from './utils/errorHandler';
import courseRoutes from './routes/courseRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // for parsing application/json

// API Routes
app.use('/api/courses', courseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Central Error Handler
app.use(errorHandler);

export default app;
