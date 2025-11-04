import { Request, Response, NextFunction } from 'express';
import { ValidationError as ExpressValidationError } from 'express-validator';
import { UploadError } from '@workspace/types';

/**
 * Format express-validator errors into a consistent structure
 */
export function formatValidationErrors(errors: ExpressValidationError[]): UploadError[] {
  return errors.map((error) => {
    const uploadError: UploadError = {
      code: 'VALIDATION_ERROR',
      message: error.msg,
    };
    
    if (error.type === 'field') {
      uploadError.field = error.path;
    }
    
    return uploadError;
  });
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  field?: string
): { success: false; errors: UploadError[] } {
  const error: UploadError = { code, message };
  
  if (field !== undefined) {
    error.field = field;
  }
  
  return {
    success: false,
    errors: [error],
  };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T): { success: true; data: T } {
  return {
    success: true,
    data,
  };
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.stack);
  res.status(500).json(
    createErrorResponse('INTERNAL_ERROR', 'Something went wrong!')
  );
}
