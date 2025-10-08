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
  MultipartUploadCompleteResponse
} from '@workspace/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useGeneratePresignedUrls() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePresignedUrls = async (files: PresignedUrlRequest[]): Promise<PresignedUrlResponse[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const request: UploadRequest = { files };
      
      const response = await fetch(`${API_BASE_URL}/api/upload/presigned-urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to generate pre-signed URLs');
      }

      const data: { success: boolean; data: UploadResponse } = await response.json();
      return data.data.uploads;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
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

export function useUploadToS3() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed due to network error'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was aborted'));
        });

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
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

export function useMultipartUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateMultipartUpload = async (request: MultipartUploadInitiateRequest): Promise<MultipartUploadInitiateResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/multipart/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to initiate multipart upload');
      }

      const data: { success: boolean; data: MultipartUploadInitiateResponse } = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generatePresignedPartUrl = async (request: MultipartUploadPartRequest): Promise<MultipartUploadPartResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/multipart/presigned-part`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to generate pre-signed part URL');
      }

      const data: { success: boolean; data: MultipartUploadPartResponse } = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const completeMultipartUpload = async (request: MultipartUploadCompleteRequest): Promise<MultipartUploadCompleteResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/multipart/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to complete multipart upload');
      }

      const data: { success: boolean; data: MultipartUploadCompleteResponse } = await response.json();
      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const abortMultipartUpload = async (uploadId: string, key: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/multipart/abort`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uploadId, key }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to abort multipart upload');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
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
