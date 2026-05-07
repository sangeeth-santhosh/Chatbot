import { AppError } from './AppError.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateName(name) {
  const value = String(name || '').trim();

  if (value.length < 2 || value.length > 80) {
    throw new AppError('Name must be between 2 and 80 characters.', 400, 'INVALID_NAME');
  }

  return value;
}

export function validateEmail(email) {
  const value = normalizeEmail(email);

  if (!emailPattern.test(value) || value.length > 254) {
    throw new AppError('A valid email address is required.', 400, 'INVALID_EMAIL');
  }

  return value;
}

export function validateText(text, fieldName = 'Text', maxLength = 2000) {
  const value = String(text || '').trim();

  if (!value) {
    throw new AppError(`${fieldName} is required.`, 400, 'INVALID_TEXT');
  }

  if (value.length > maxLength) {
    throw new AppError(`${fieldName} cannot exceed ${maxLength} characters.`, 400, 'TEXT_TOO_LONG');
  }

  return value;
}
