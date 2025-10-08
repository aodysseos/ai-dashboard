import { useState, useCallback } from 'react';
import { useGeneratePresignedUrls, useUploadToS3, useMultipartUpload } from '../../../common/hooks/useUpload';
import { PresignedUrlRequest } from '@workspace/types';

// S3MultipartService for file chunking (client-side utility)
class S3MultipartService {
  static async splitFileIntoChunks(
    file: File,
    chunkSize: number = 5 * 1024 * 1024
  ): Promise<Blob[]> {
    const chunks: Blob[] = [];
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      chunks.push(chunk);
      start = end;
    }

    return chunks;
  }
}

export interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  s3Key?: string;
}

export interface UsePdfUploadOptions {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  concurrency?: number;
}

export function usePdfUpload(options: UsePdfUploadOptions = {}) {
  const {
    maxFiles = 200,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    concurrency = 5
  } = options;

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const { generatePresignedUrls, isLoading: isGeneratingUrls, error: urlError } = useGeneratePresignedUrls();
  const { uploadFile, isUploading: isUploadingFile, error: uploadError } = useUploadToS3();
  const { 
    initiateMultipartUpload, 
    generatePresignedPartUrl, 
    completeMultipartUpload,
    isLoading: isMultipartLoading,
    error: multipartError 
  } = useMultipartUpload();

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return 'Only PDF files are allowed';
    }

    // Check file size
    if (file.size > maxFileSize) {
      return `File size must not exceed ${Math.round(maxFileSize / (1024 * 1024))}MB`;
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
      return 'File name is required';
    }

    return null;
  }, [maxFileSize]);

  const addFiles = useCallback((newFiles: File[]) => {
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

      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        return;
      }

      // Check for duplicate files
      const isDuplicate = files.some(f => f.file.name === file.name && f.file.size === file.size);
      if (isDuplicate) {
        errors.push(`${file.name}: File already added`);
        return;
      }

      validFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        status: 'pending',
        progress: 0
      });
    });

    if (errors.length > 0) {
      console.warn('File validation errors:', errors);
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [files, maxFiles, validateFile]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const uploadFileWithMultipart = useCallback(async (file: UploadFile) => {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const isLargeFile = file.file.size > CHUNK_SIZE;

    if (!isLargeFile) {
      // Use regular upload for small files
      const presignedRequests: PresignedUrlRequest[] = [{
        filename: file.file.name,
        size: file.file.size,
        contentType: file.file.type
      }];

      const presignedUrls = await generatePresignedUrls(presignedRequests);
      const presignedUrl = presignedUrls[0];

      // Update file with S3 key
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, s3Key: presignedUrl.key } : f
      ));

      await uploadFile(
        file.file,
        presignedUrl.uploadUrl,
        (progress) => {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, progress } : f
          ));
        }
      );
    } else {
      // Use multipart upload for large files
      const { uploadId, key } = await initiateMultipartUpload({
        filename: file.file.name,
        contentType: file.file.type,
        size: file.file.size
      });

      // Update file with S3 key
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, s3Key: key } : f
      ));

      // Split file into chunks
      const chunks = await S3MultipartService.splitFileIntoChunks(file.file, CHUNK_SIZE);
      const parts: Array<{ partNumber: number; etag: string }> = [];

      // Upload each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const partNumber = i + 1;

        // Get pre-signed URL for this part
        const { uploadUrl } = await generatePresignedPartUrl({
          uploadId,
          key,
          partNumber
        });

        // Upload the chunk
        const etag = await uploadChunk(chunk, uploadUrl);
        parts.push({ partNumber, etag });

        // Update progress
        const chunkProgress = Math.round((partNumber / chunks.length) * 100);
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, progress: chunkProgress } : f
        ));
      }

      // Complete multipart upload
      await completeMultipartUpload({
        uploadId,
        key,
        parts
      });
    }
  }, [generatePresignedUrls, uploadFile, initiateMultipartUpload, generatePresignedPartUrl, completeMultipartUpload]);

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

  const uploadFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Upload files with concurrency control
      const uploadPromises: Promise<void>[] = [];
      const semaphore = new Array(concurrency).fill(null);

      for (const file of pendingFiles) {
        const uploadPromise = (async () => {
          // Wait for available slot
          await new Promise(resolve => {
            const checkSlot = () => {
              const availableIndex = semaphore.findIndex(slot => slot === null);
              if (availableIndex !== -1) {
                semaphore[availableIndex] = file.id;
                resolve(undefined);
              } else {
                setTimeout(checkSlot, 100);
              }
            };
            checkSlot();
          });

          try {
            // Update status to uploading
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, status: 'uploading' as const } : f
            ));

            // Upload file (regular or multipart)
            await uploadFileWithMultipart(file);

            // Update status to success
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, status: 'success' as const, progress: 100 } : f
            ));
          } catch (error) {
            // Update status to error
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { 
                ...f, 
                status: 'error' as const, 
                error: error instanceof Error ? error.message : 'Upload failed'
              } : f
            ));
          } finally {
            // Release slot
            const slotIndex = semaphore.findIndex(slot => slot === file.id);
            if (slotIndex !== -1) {
              semaphore[slotIndex] = null;
            }
          }
        });

        uploadPromises.push(uploadPromise());
      }

      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [files, uploadFileWithMultipart, concurrency]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, [addFiles]);

  const hasFiles = files.length > 0;
  const hasPendingFiles = files.some(f => f.status === 'pending');
  const hasUploadingFiles = files.some(f => f.status === 'uploading');
  const hasErrorFiles = files.some(f => f.status === 'error');
  const hasSuccessFiles = files.some(f => f.status === 'success');

  return {
    files,
    isUploading: isUploading || isUploadingFile || isMultipartLoading,
    isGeneratingUrls,
    dragActive,
    error: urlError || uploadError || multipartError,
    hasFiles,
    hasPendingFiles,
    hasUploadingFiles,
    hasErrorFiles,
    hasSuccessFiles,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    handleDrag,
    handleDrop,
    handleFileInput,
  };
}
