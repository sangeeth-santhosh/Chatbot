import { User } from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';

export function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      next(new Error('Authentication is required.'));
      return;
    }

    const payload = verifyToken(token);

    User.findById(payload.sub)
      .then((user) => {
        if (!user) {
          next(new Error('User not found.'));
          return;
        }

        socket.data.user = user;
        socket.data.activeRooms = new Set();
        next();
      })
      .catch(next);
  } catch {
    next(new Error('Invalid token.'));
  }
}
