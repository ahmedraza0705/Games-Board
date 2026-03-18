import { ERROR_MESSAGES } from '@/constants';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 6) {
    return {
      valid: false,
      error: ERROR_MESSAGES.PASSWORD_TOO_SHORT,
    };
  }
  return { valid: true };
};

export const validatePasswords = (
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return {
      valid: false,
      error: ERROR_MESSAGES.PASSWORD_MISMATCH,
    };
  }
  return { valid: true };
};

export const validateSignup = (
  email: string,
  password: string,
  confirmPassword: string,
  fullName: string
): { valid: boolean; error?: string } => {
  if (!email || !password || !confirmPassword || !fullName) {
    return {
      valid: false,
      error: 'Please fill in all fields',
    };
  }

  if (!validateEmail(email)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_EMAIL,
    };
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    return passwordCheck;
  }

  const passwordMatch = validatePasswords(password, confirmPassword);
  if (!passwordMatch.valid) {
    return passwordMatch;
  }

  return { valid: true };
};

export const validateLogin = (
  email: string,
  password: string
): { valid: boolean; error?: string } => {
  if (!email || !password) {
    return {
      valid: false,
      error: 'Please fill in all fields',
    };
  }

  if (!validateEmail(email)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_EMAIL,
    };
  }

  return { valid: true };
};
