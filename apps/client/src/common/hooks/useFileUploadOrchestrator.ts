import { useState, useCallback } from 'react';
import {
  useGeneratePresignedUrls,
  useUploadToS3,
  useMultipartUpload,
} from './useUpload';
import {
  splitFileIntoChunks,
  generateFileId,
  validateFile,
  ConcurrencyQueue,
  CHUNK_SIZE,
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_CONCURRENCY,
} from '../lib/fileUploadUtils';
import { PresignedUrlRequest } from '@workspace/types';
import { logError } from '../lib/errorHandler';

export interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  s3Key?: string;
}

export interface UseFileUploadOrchestratorOptions {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  concurrency?: number;
}

/**
 * Hook for managing file uploads with state management, validation, and orchestration
 */
export function useFileUploadOrchestrator(
  options: UseFileUploadOrchestratorOptions = {}
) {
  const {
    maxFiles = DEFAULT_MAX_FILES,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    concurrency = DEFAULT_CONCURRENCY,
  } = options;

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { generatePresignedUrls, isLoading: isGeneratingUrls, error: urlError } =
    useGeneratePresignedUrls();
  const { uploadFile, isUploading: isUploadingFile, error: uploadError } =
    useUploadToS3();
  const {
    initiateMultipartUpload,
    generatePresignedPartUrl,
    completeMultipartUpload,
    isLoading: isMultipartLoading,
    error: multipartError,
  } = useMultipartUpload();

  /**
   * Add files to the upload queue
   */
  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles: UploadFile[] = [];
      const errors: string[] = [];

      // Check total file count
      if (files.length + newFiles.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
      }

      newFiles.forEach((file) => {
        if (files.length + validFiles.length >= maxFiles) {
          return;
        }

        const validationError = validateFile(file, maxFileSize);
        if (validationError) {
          errors.push(`${file.name}: ${validationError}`);
          return;
        }

        // Check for duplicate files
        const isDuplicate = files.some(
          (f) => f.file.name === file.name && f.file.size === file.size
        );
        if (isDuplicate) {
          errors.push(`${file.name}: File already added`);
          return;
        }

        validFiles.push({
          id: generateFileId(),
          file,
          status: 'pending',
          progress: 0,
        });
      });

      if (errors.length > 0) {
        logError(new Error(errors.join('; ')), 'useFileUploadOrchestrator.addFiles');
      }

      setFiles((prev) => [...prev, ...validFiles]);
    },
    [files, maxFiles, maxFileSize]
  );

  /**
   * Remove a file from the queue
   */
  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  /**
   * Clear all files from the queue
   */
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  /**
   * Upload a chunk to S3
   */
  const uploadChunk = async (chunk: Blob, uploadUrl: string): Promise<string> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: chunk,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload chunk: ${response.status}`);
    }

    // Extract ETag from response headers
    const etag = response.headers.get('ETag');
    if (!etag) {
      throw new Error('No ETag received from S3');
    }

    return etag.replace(/"/g, ''); // Remove quotes from ETag
  };

  /**
   * Upload a file (regular or multipart)
   */
  const uploadFileWithMultipart = useCallback(
    async (file: UploadFile) => {
      const isLargeFile = file.file.size > CHUNK_SIZE;

      if (!isLargeFile) {
        // Use regular upload for small files
        const presignedRequests: PresignedUrlRequest[] = [
          {
            filename: file.file.name,
            size: file.file.size,
            contentType: file.file.type,
          },
        ];

        const presignedUrls = await generatePresignedUrls(presignedRequests);
        const presignedUrl = presignedUrls[0];

        // Update file with S3 key
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, s3Key: presignedUrl.key } : f
          )
        );

        await uploadFile(
          file.file,
          presignedUrl.uploadUrl,
          (progress) => {
            setFiles((prev) =>
              prev.map((f) => (f.id === file.id ? { ...f, progress } : f))
            );
          }
        );
      } else {
        // Use multipart upload for large files
        const { uploadId, key } = await initiateMultipartUpload({
          filename: file.file.name,
          contentType: file.file.type,
          size: file.file.size,
        });

        // Update file with S3 key
        setFiles((prev) =>
          prev.map((f) => (f.id === file.id ? { ...f, s3Key: key } : f))
        );

        // Split file into chunks
        const chunks = splitFileIntoChunks(file.file, CHUNK_SIZE);
        const parts: Array<{ partNumber: number; etag: string }> = [];

        // Upload each chunk
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const partNumber = i + 1;

          // Get pre-signed URL for this part
          const { uploadUrl } = await generatePresignedPartUrl({
            uploadId,
            key,
            partNumber,
          });

          // Upload the chunk
          const etag = await uploadChunk(chunk, uploadUrl);
          parts.push({ partNumber, etag });

          // Update progress
          const chunkProgress = Math.round((partNumber / chunks.length) * 100);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id ? { ...f, progress: chunkProgress } : f
            )
          );
        }

        // Complete multipart upload
        await completeMultipartUpload({
          uploadId,
          key,
          parts,
        });
      }
    },
    [
      generatePresignedUrls,
      uploadFile,
      initiateMultipartUpload,
      generatePresignedPartUrl,
      completeMultipartUpload,
    ]
  );

  /**
   * Upload all pending files with concurrency control
   */
  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Create upload tasks with concurrency control
      const queue = new ConcurrencyQueue(concurrency);

      const uploadPromises = pendingFiles.map((file) =>
        queue.execute(async () => {
          try {
            // Update status to uploading
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id ? { ...f, status: 'uploading' as const } : f
              )
            );

            // Upload file (regular or multipart)
            await uploadFileWithMultipart(file);

            // Update status to success
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id
                  ? { ...f, status: 'success' as const, progress: 100 }
                  : f
              )
            );
          } catch (error) {
            // Update status to error
            setFiles((prev) =>
              prev.map((f) =>
                f.id === file.id
                  ? {
                      ...f,
                      status: 'error' as const,
                      error:
                        error instanceof Error ? error.message : 'Upload failed',
                    }
                  : f
              )
            );
          }
        })
      );

      // Execute all uploads with concurrency control
      await Promise.all(uploadPromises);
    } catch (error) {
      logError(error, 'useFileUploadOrchestrator.uploadFiles');
    } finally {
      setIsUploading(false);
    }
  }, [files, uploadFileWithMultipart, concurrency]);

  return {
    files,
    isUploading: isUploading || isUploadingFile || isMultipartLoading,
    isGeneratingUrls,
    error: urlError || uploadError || multipartError,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
  };
}

