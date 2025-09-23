import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
export const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;

  // Log error details
  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);
  console.error('Stack:', err.stack);
  console.error('Request:', {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Send error response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      error: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
    });
  } else {
    // Production error response
    if (err.isOperational) {
      res.status(err.statusCode).json({
        error: err.message,
      });
    } else {
      res.status(500).json({
        error: 'Something went wrong!',
      });
    }
  }
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Rate limiting helper
export const createRateLimit = (windowMs: number, max: number) => {
  const requests = new Map();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const userRequests = requests.get(ip).filter((time: number) => time > windowStart);
    
    if (userRequests.length >= max) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    userRequests.push(now);
    requests.set(ip, userRequests);
    
    next();
  };
};