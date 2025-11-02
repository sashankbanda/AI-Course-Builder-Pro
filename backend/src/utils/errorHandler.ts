import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    // Default to a 500 server error if no specific status is set
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        message: err.message || 'An unexpected error occurred on the server.',
        // Optionally include stack trace in development environment
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
