import { ERROR_MESSAGES } from '@/constants';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleAuthError = (error: any): string => {
  if (!error) {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Handle Supabase specific errors
  if (error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('invalid login credentials') || message.includes('user not found')) {
      return ERROR_MESSAGES.INVALID_CREDENTIALS;
    }
    
    if (message.includes('user already exists')) {
      return 'Email already registered. Please sign in instead.';
    }
    
    if (message.includes('network')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

export const handleDatabaseError = (error: any): string => {
  if (!error) {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  const message = error.message?.toLowerCase() || '';

  if (message.includes('network') || message.includes('connection')) {
    return 'Unable to connect to server. Please check your internet connection.';
  }

  if (message.includes('permission')) {
    return 'You do not have permission to perform this action.';
  }

  if (message.includes('not found')) {
    return ERROR_MESSAGES.USER_NOT_FOUND;
  }

  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
};

export const handleError = (error: any): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error?.message) {
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

export const logError = (context: string, error: any) => {
  console.error(`[${context}]`, error);
  // In production, you'd send this to a logging service
};
