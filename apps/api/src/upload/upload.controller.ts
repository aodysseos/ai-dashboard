import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { generatePresignedUploadUrls, generateS3Key } from './services/s3.service';

// Define types locally to avoid cross-package dependencies
interface PresignedUrlRequest {
  filename: string;
  size: number;
  contentType: string;
}

interface PresignedUrlResponse {
  key: string;
  uploadUrl: string;
  expiresAt: string;
}

interface UploadRequest {
  files: PresignedUrlRequest[];
}

interface UploadResponse {
  uploads: PresignedUrlResponse[];
}

interface UploadError {
  code: string;
  message: string;
  field?: string;
}

/**
 * Generate pre-signed URLs for file uploads
 */
export async function generatePresignedUrls(req: Request, res: Response): Promise<void> {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array().map(error => ({
          code: 'VALIDATION_ERROR',
          message: error.msg,
          field: error.type === 'field' ? error.path : undefined
        }))
      });
      return;
    }

    const { files }: UploadRequest = req.body;

    // Validate file count
    if (files.length === 0) {
      res.status(400).json({
        success: false,
        errors: [{
          code: 'NO_FILES',
          message: 'At least one file is required'
        }]
      });
      return;
    }

    if (files.length > 200) {
      res.status(400).json({
        success: false,
        errors: [{
          code: 'TOO_MANY_FILES',
          message: 'Maximum 200 files allowed per request'
        }]
      });
      return;
    }

    // Validate each file
    const validationErrors: UploadError[] = [];
    files.forEach((file, index) => {
      if (file.contentType !== 'application/pdf') {
        validationErrors.push({
          code: 'INVALID_FILE_TYPE',
          message: 'Only PDF files are allowed',
          field: `files[${index}].contentType`
        });
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        validationErrors.push({
          code: 'FILE_TOO_LARGE',
          message: 'File size must not exceed 10MB',
          field: `files[${index}].size`
        });
      }

      if (file.size <= 0) {
        validationErrors.push({
          code: 'INVALID_FILE_SIZE',
          message: 'File size must be greater than 0',
          field: `files[${index}].size`
        });
      }

      if (!file.filename || file.filename.trim() === '') {
        validationErrors.push({
          code: 'MISSING_FILENAME',
          message: 'Filename is required',
          field: `files[${index}].filename`
        });
      }
    });

    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        errors: validationErrors
      });
      return;
    }

    // Generate S3 keys and pre-signed URLs
    const uploadRequests = files.map(file => ({
      key: generateS3Key(file.filename),
      contentType: file.contentType
    }));

    const uploads = await generatePresignedUploadUrls(uploadRequests);

    const response: UploadResponse = {
      uploads: uploads.map(upload => ({
        key: upload.key,
        uploadUrl: upload.uploadUrl,
        expiresAt: upload.expiresAt.toISOString()
      }))
    };

    res.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    console.error('Error generating pre-signed URLs:', error);
    res.status(500).json({
      success: false,
      errors: [{
        code: 'INTERNAL_ERROR',
        message: 'Failed to generate pre-signed URLs'
      }]
    });
  }
}

/**
 * Validation middleware for presigned URL generation
 */
export const validatePresignedUrlRequest = [
  body('files')
    .isArray({ min: 1, max: 200 })
    .withMessage('Files must be an array with 1-200 items'),
  
  body('files.*.filename')
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Filename must be a non-empty string (max 255 characters)'),
  
  body('files.*.size')
    .isInt({ min: 1, max: 10 * 1024 * 1024 })
    .withMessage('File size must be between 1 byte and 10MB'),
  
  body('files.*.contentType')
    .equals('application/pdf')
    .withMessage('Content type must be application/pdf')
];

