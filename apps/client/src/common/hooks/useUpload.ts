import { useState } from 'react';
import {
  PresignedUrlRequest,
  PresignedUrlResponse,
  UploadRequest,
  UploadResponse,
  MultipartUploadInitiateRequest,
  MultipartUploadInitiateResponse,
  MultipartUploadPartRequest,
  MultipartUploadPartResponse,
  MultipartUploadCompleteRequest,
  MultipartUploadCompleteResponse,
} from '@workspace/types';
import { fetchApi } from '../lib/api';
import { createUserFriendlyError, logError } from '../lib/errorHandler';

/**
 * Hook for generating presigned URLs for file uploads
 * @returns Object with generatePresignedUrls function and loading/error states
 */
export function useGeneratePresignedUrls() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePresignedUrls = async (
    files: PresignedUrlRequest[]
  ): Promise<PresignedUrlResponse[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const request: UploadRequest = { files };

      const data = await fetchApi<{ success: boolean; data: UploadResponse }>(
        '/api/upload/presigned-urls',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      return data.data.uploads;
    } catch (err) {
      const errorMessage = createUserFriendlyError(err, 'Failed to generate pre-signed URLs');
      setError(errorMessage);
      logError(err, 'useGeneratePresignedUrls');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generatePresignedUrls,
    isLoading,
    error,
  };
}

/**
 * Hook for uploading files to S3 using presigned URLs
 * @returns Object with uploadFile function and upload state
 */
export function useUploadToS3() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload a file to S3 using a presigned URL
   * @param file - The file to upload
   * @param presignedUrl - The presigned URL for upload
   * @param onProgress - Optional progress callback
   */
  const uploadFile = async (
    file: File,
    presignedUrl: string,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progressPercent = Math.round((event.loaded / event.total) * 100);
            setProgress(progressPercent);
            onProgress?.(progressPercent);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            resolve();
          } else {
            const error = new Error(`Upload failed with status ${xhr.status}`);
            logError(error, 'useUploadToS3.uploadFile');
            reject(error);
          }
        });

        xhr.addEventListener('error', () => {
          const error = new Error('Upload failed due to network error');
          logError(error, 'useUploadToS3.uploadFile');
          reject(error);
        });

        xhr.addEventListener('abort', () => {
          const error = new Error('Upload was aborted');
          logError(error, 'useUploadToS3.uploadFile');
          reject(error);
        });

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    } catch (err) {
      const errorMessage = createUserFriendlyError(err, 'Upload failed');
      setError(errorMessage);
      logError(err, 'useUploadToS3');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
    error,
  };
}

/**
 * Hook for multipart upload operations
 * @returns Object with multipart upload functions and loading/error states
 */
export function useMultipartUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initiate a multipart upload
   */
  const initiateMultipartUpload = async (
    request: MultipartUploadInitiateRequest
  ): Promise<MultipartUploadInitiateResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchApi<{ success: boolean; data: MultipartUploadInitiateResponse }>(
        '/api/upload/multipart/initiate',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      return data.data;
    } catch (err) {
      const errorMessage = createUserFriendlyError(err, 'Failed to initiate multipart upload');
      setError(errorMessage);
      logError(err, 'useMultipartUpload.initiateMultipartUpload');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate presigned URL for a multipart upload part
   */
  const generatePresignedPartUrl = async (
    request: MultipartUploadPartRequest
  ): Promise<MultipartUploadPartResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchApi<{ success: boolean; data: MultipartUploadPartResponse }>(
        '/api/upload/multipart/presigned-part',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      return data.data;
    } catch (err) {
      const errorMessage = createUserFriendlyError(err, 'Failed to generate pre-signed part URL');
      setError(errorMessage);
      logError(err, 'useMultipartUpload.generatePresignedPartUrl');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete a multipart upload
   */
  const completeMultipartUpload = async (
    request: MultipartUploadCompleteRequest
  ): Promise<MultipartUploadCompleteResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchApi<{ success: boolean; data: MultipartUploadCompleteResponse }>(
        '/api/upload/multipart/complete',
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );

      return data.data;
    } catch (err) {
      const errorMessage = createUserFriendlyError(err, 'Failed to complete multipart upload');
      setError(errorMessage);
      logError(err, 'useMultipartUpload.completeMultipartUpload');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Abort a multipart upload
   */
  const abortMultipartUpload = async (uploadId: string, key: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchApi<void>('/api/upload/multipart/abort', {
        method: 'DELETE',
        body: JSON.stringify({ uploadId, key }),
      });
    } catch (err) {
      const errorMessage = createUserFriendlyError(err, 'Failed to abort multipart upload');
      setError(errorMessage);
      logError(err, 'useMultipartUpload.abortMultipartUpload');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateMultipartUpload,
    generatePresignedPartUrl,
    completeMultipartUpload,
    abortMultipartUpload,
    isLoading,
    error,
  };
}
