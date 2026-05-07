import env from '../config/env.js';

export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    error: {
      message: error.isOperational ? error.message : 'Something went wrong.',
      code: error.code || 'INTERNAL_ERROR',
      ...(env.nodeEnv === 'development' ? { details: error.message } : {}),
    },
  });
}
