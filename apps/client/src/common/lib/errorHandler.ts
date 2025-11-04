/**
 * Error handling utilities
 */

/**
 * Error types for client-side error handling
 */
export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface UploadError {
  code: string;
  message: string;
  fileId?: string;
}

/**
 * Parse API error response
 * @param error - The error object or response
 * @returns Formatted error message
 */
export function parseApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Extract error message from API error response
 * @param errorData - The error response data
 * @returns Error message string
 */
export function extractErrorMessage(errorData: {
  errors?: Array<{ code?: string; message?: string; field?: string }>;
  error?: string;
  message?: string;
}): string {
  if (errorData.errors?.[0]?.message) {
    return errorData.errors[0].message;
  }

  if (errorData.error) {
    return errorData.error;
  }

  if (errorData.message) {
    return errorData.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Create user-friendly error message
 * @param error - The error object
 * @param defaultMessage - Default message if error cannot be parsed
 * @returns User-friendly error message
 */
export function createUserFriendlyError(
  error: unknown,
  defaultMessage = 'An unexpected error occurred'
): string {
  if (error instanceof Error) {
    // Handle common error patterns
    if (error.message.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    }

    if (error.message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please try again later.';
    }

    if (error.message.includes('API Error')) {
      return error.message.replace('API Error: ', '');
    }

    return error.message || defaultMessage;
  }

  return defaultMessage;
}

/**
 * Log error for debugging (can be replaced with proper error tracking service)
 * @param error - The error to log
 * @param context - Additional context information
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }
  // In production, this would send to error tracking service
  // Example: Sentry.captureException(error, { extra: { context } });
}

