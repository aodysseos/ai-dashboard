import { Router } from 'express';
import {
  generatePresignedUrls,
  validatePresignedUrlRequest
} from './upload.controller';
import {
  initiateMultipartUpload,
  generatePresignedPartUrl,
  completeMultipartUpload,
  abortMultipartUpload,
  validateInitiateRequest,
  validatePartRequest,
  validateCompleteRequest
} from './multipart.controller';

const router = Router();

/**
 * @route POST /api/upload/presigned-urls
 * @desc Generate pre-signed URLs for file uploads
 * @access Public (in production, add authentication middleware)
 */
router.post(
  '/presigned-urls',
  validatePresignedUrlRequest,
  generatePresignedUrls
);

/**
 * @route POST /api/upload/multipart/initiate
 * @desc Initiate multipart upload for large files
 * @access Public (in production, add authentication middleware)
 */
router.post(
  '/multipart/initiate',
  validateInitiateRequest,
  initiateMultipartUpload
);

/**
 * @route POST /api/upload/multipart/presigned-part
 * @desc Generate pre-signed URL for uploading a part
 * @access Public (in production, add authentication middleware)
 */
router.post(
  '/multipart/presigned-part',
  validatePartRequest,
  generatePresignedPartUrl
);

/**
 * @route POST /api/upload/multipart/complete
 * @desc Complete multipart upload
 * @access Public (in production, add authentication middleware)
 */
router.post(
  '/multipart/complete',
  validateCompleteRequest,
  completeMultipartUpload
);

/**
 * @route DELETE /api/upload/multipart/abort
 * @desc Abort multipart upload
 * @access Public (in production, add authentication middleware)
 */
router.delete(
  '/multipart/abort',
  abortMultipartUpload
);

export default router;

