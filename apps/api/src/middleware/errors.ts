import { Response } from 'express';
import { createErrorResponse } from './error.middleware';

/**
 * Send a bad request error (400)
 */
export function sendBadRequest(
  res: Response,
  code: string,
  message: string,
  field?: string
): void {
  res.status(400).json(createErrorResponse(code, message, field));
}

/**
 * Send a not found error (404)
 */
export function sendNotFound(
  res: Response,
  message: string = 'Resource not found'
): void {
  res.status(404).json(createErrorResponse('NOT_FOUND', message));
}

/**
 * Send an internal server error (500)
 */
export function sendInternalError(
  res: Response,
  message: string = 'Internal server error'
): void {
  res.status(500).json(createErrorResponse('INTERNAL_ERROR', message));
}

/**
 * Send an unauthorized error (401)
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized'
): void {
  res.status(401).json(createErrorResponse('UNAUTHORIZED', message));
}

/**
 * Send a forbidden error (403)
 */
export function sendForbidden(
  res: Response,
  message: string = 'Forbidden'
): void {
  res.status(403).json(createErrorResponse('FORBIDDEN', message));
}
