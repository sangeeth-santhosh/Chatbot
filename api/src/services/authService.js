import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import { validateEmail, validateName } from '../utils/validators.js';

function authResponse(user) {
  return {
    user: user.toSafeObject(),
    token: signToken(user),
  };
}

export async function registerUser(payload) {
  const name = validateName(payload.name);
  const email = validateEmail(payload.email);

  try {
    const user = await User.create({ name, email });
    return authResponse(user);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Email is already registered.', 409, 'EMAIL_EXISTS');
    }

    throw error;
  }
}

export async function loginUser(payload) {
  const email = validateEmail(payload.email);
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('No account exists for this email.', 401, 'INVALID_LOGIN');
  }

  return authResponse(user);
}
