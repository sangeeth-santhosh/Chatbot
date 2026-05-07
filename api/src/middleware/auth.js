import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';

function extractToken(req) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice(7);
}

export async function requireAuth(req, _res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new AppError('Authentication is required.', 401, 'AUTH_REQUIRED');
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw new AppError('Authenticated user no longer exists.', 401, 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError('Invalid or expired token.', 401, 'INVALID_TOKEN'));
      return;
    }

    next(error);
  }
}
