import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  initiateMultipartUpload as initiateMultipartUploadService,
  generatePresignedPartUrl as generatePresignedPartUrlService,
  completeMultipartUpload as completeMultipartUploadService,
  abortMultipartUpload as abortMultipartUploadService
} from './services/s3.multipart.service';
import { generateS3Key } from './services/s3.service';

// Define types locally to avoid cross-package dependencies
interface MultipartUploadInitiateRequest {
  filename: string;
  contentType: string;
  size: number;
}

interface MultipartUploadInitiateResponse {
  uploadId: string;
  key: string;
}

interface MultipartUploadPartRequest {
  uploadId: string;
  key: string;
  partNumber: number;
}

interface MultipartUploadPartResponse {
  partNumber: number;
  uploadUrl: string;
  expiresAt: string;
}

interface MultipartUploadCompleteRequest {
  uploadId: string;
  key: string;
  parts: Array<{
    partNumber: number;
    etag: string;
  }>;
}

interface MultipartUploadCompleteResponse {
  location: string;
  etag: string;
}

/**
 * Initiate multipart upload
 */
export async function initiateMultipartUpload(req: Request, res: Response): Promise<void> {
    try {
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

      const { filename, contentType, size }: MultipartUploadInitiateRequest = req.body;

      // Validate file size (should be > 5MB for multipart)
      if (size <= 5 * 1024 * 1024) {
        res.status(400).json({
          success: false,
          errors: [{
            code: 'FILE_TOO_SMALL',
            message: 'File must be larger than 5MB to use multipart upload'
          }]
        });
        return;
      }

      // Generate S3 key
      const key = generateS3Key(filename);

      // Initiate multipart upload
      const result = await initiateMultipartUploadService(key, contentType);

      const response: MultipartUploadInitiateResponse = {
        uploadId: result.uploadId,
        key: result.key
      };

      res.json({
        success: true,
        data: response
      });

    } catch (error: any) {
      console.error('Error initiating multipart upload:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'INTERNAL_ERROR',
          message: 'Failed to initiate multipart upload'
        }]
      });
    }
}

/**
 * Generate pre-signed URL for uploading a part
 */
export async function generatePresignedPartUrl(req: Request, res: Response): Promise<void> {
    try {
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

      const { uploadId, key, partNumber }: MultipartUploadPartRequest = req.body;

      // Validate part number
      if (partNumber < 1 || partNumber > 10000) {
        res.status(400).json({
          success: false,
          errors: [{
            code: 'INVALID_PART_NUMBER',
            message: 'Part number must be between 1 and 10000'
          }]
        });
        return;
      }

      const result = await generatePresignedPartUrlService(key, uploadId, partNumber);

      const response: MultipartUploadPartResponse = {
        partNumber,
        uploadUrl: result.uploadUrl,
        expiresAt: result.expiresAt.toISOString()
      };

      res.json({
        success: true,
        data: response
      });

    } catch (error: any) {
      console.error('Error generating pre-signed part URL:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate pre-signed part URL'
        }]
      });
    }
}

/**
 * Complete multipart upload
 */
export async function completeMultipartUpload(req: Request, res: Response): Promise<void> {
    try {
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

      const { uploadId, key, parts }: MultipartUploadCompleteRequest = req.body;

      // Validate parts array
      if (!parts || parts.length === 0) {
        res.status(400).json({
          success: false,
          errors: [{
            code: 'NO_PARTS',
            message: 'At least one part is required'
          }]
        });
        return;
      }

      // Validate part numbers are sequential
      const sortedParts = parts.sort((a, b) => a.partNumber - b.partNumber);
      for (let i = 0; i < sortedParts.length; i++) {
        if (sortedParts[i]?.partNumber !== i + 1) {
          res.status(400).json({
            success: false,
            errors: [{
              code: 'INVALID_PART_SEQUENCE',
              message: 'Part numbers must be sequential starting from 1'
            }]
          });
          return;
        }
      }

      const result = await completeMultipartUploadService(uploadId, key, parts);

      const response: MultipartUploadCompleteResponse = {
        location: result.location,
        etag: result.etag
      };

      res.json({
        success: true,
        data: response
      });

    } catch (error: any) {
      console.error('Error completing multipart upload:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'INTERNAL_ERROR',
          message: 'Failed to complete multipart upload'
        }]
      });
    }
}

/**
 * Abort multipart upload
 */
export async function abortMultipartUpload(req: Request, res: Response): Promise<void> {
    try {
      const { uploadId, key } = req.body;

      if (!uploadId || !key) {
        res.status(400).json({
          success: false,
          errors: [{
            code: 'MISSING_PARAMETERS',
            message: 'uploadId and key are required'
          }]
        });
        return;
      }

      await abortMultipartUploadService(key, uploadId);

      res.json({
        success: true,
        message: 'Multipart upload aborted successfully'
      });

    } catch (error: any) {
      console.error('Error aborting multipart upload:', error);
      res.status(500).json({
        success: false,
        errors: [{
          code: 'INTERNAL_ERROR',
          message: 'Failed to abort multipart upload'
        }]
      });
    }
}

/**
 * Validation middleware for multipart upload initiation
 */
export const validateInitiateRequest = [
    body('filename')
      .isString()
      .isLength({ min: 1, max: 255 })
      .withMessage('Filename must be a non-empty string (max 255 characters)'),
    
    body('contentType')
      .equals('application/pdf')
      .withMessage('Content type must be application/pdf'),
    
    body('size')
      .isInt({ min: 5 * 1024 * 1024 + 1 })
      .withMessage('File size must be greater than 5MB for multipart upload')
];

/**
 * Validation middleware for part URL generation
 */
export const validatePartRequest = [
    body('uploadId')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Upload ID is required'),
    
    body('key')
      .isString()
      .isLength({ min: 1 })
      .withMessage('S3 key is required'),
    
    body('partNumber')
      .isInt({ min: 1, max: 10000 })
      .withMessage('Part number must be between 1 and 10000')
];

/**
 * Validation middleware for multipart completion
 */
export const validateCompleteRequest = [
    body('uploadId')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Upload ID is required'),
    
    body('key')
      .isString()
      .isLength({ min: 1 })
      .withMessage('S3 key is required'),
    
    body('parts')
      .isArray({ min: 1 })
      .withMessage('Parts array is required and must not be empty'),
    
    body('parts.*.partNumber')
      .isInt({ min: 1, max: 10000 })
      .withMessage('Part number must be between 1 and 10000'),
    
    body('parts.*.etag')
      .isString()
      .isLength({ min: 1 })
      .withMessage('ETag is required for each part')
];

