import { Router } from 'express';
import { UploadController } from './upload.controller';
import { MultipartController } from './multipart.controller';

const router = Router();
const uploadController = new UploadController();
const multipartController = new MultipartController();

/**
 * @route POST /api/upload/presigned-urls
 * @desc Generate pre-signed URLs for file uploads
 * @access Public (in production, add authentication middleware)
 */
router.post(
  '/presigned-urls',
  uploadController.validatePresignedUrlRequest,
  uploadController.generatePresignedUrls
);

/**
 * @route POST /api/upload/multipart/initiate
 * @desc Initiate multipart upload for large files
 * @access Public (in production, add authentication middleware)
 */
router.post(
  '/multipart/initiate',
  multipartController.validateInitiateRequest,
  multipartController.initiateMultipartUpload
);

/**
 * @route POST /api/upload/multipart/presigned-part
 * @desc Generate pre-signed URL for uploading a part
 * @access Public (in production, add authentication middleware)
 */
router.post(
  '/multipart/presigned-part',
  multipartController.validatePartRequest,
  multipartController.generatePresignedPartUrl
);

/**
 * @route POST /api/upload/multipart/complete
 * @desc Complete multipart upload
 * @access Public (in production, add authentication middleware)
 */
router.post(
  '/multipart/complete',
  multipartController.validateCompleteRequest,
  multipartController.completeMultipartUpload
);

/**
 * @route DELETE /api/upload/multipart/abort
 * @desc Abort multipart upload
 * @access Public (in production, add authentication middleware)
 */
router.delete(
  '/multipart/abort',
  multipartController.abortMultipartUpload
);

export default router;

