import { useState, useCallback } from 'react';
import { useFileUploadOrchestrator, type UploadFile } from '../../../common/hooks/useFileUploadOrchestrator';

export interface UsePdfUploadOptions {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  concurrency?: number;
}

/**
 * Main hook for PDF upload functionality
 * Composes file upload orchestration with drag and drop handlers
 */
export function usePdfUpload(options: UsePdfUploadOptions = {}) {
  const [dragActive, setDragActive] = useState(false);

  // Use the orchestrator for file state and upload logic
  const {
    files,
    isUploading,
    isGeneratingUrls,
    error,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
  } = useFileUploadOrchestrator(options);

  /**
   * Handle drag events
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  /**
   * Handle drop events
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
      }
    },
    [addFiles]
  );

  /**
   * Handle file input change
   */
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFiles = Array.from(e.target.files);
        addFiles(selectedFiles);
      }
    },
    [addFiles]
  );

  // Derived state
  const hasFiles = files.length > 0;
  const hasPendingFiles = files.some((f) => f.status === 'pending');
  const hasUploadingFiles = files.some((f) => f.status === 'uploading');
  const hasErrorFiles = files.some((f) => f.status === 'error');
  const hasSuccessFiles = files.some((f) => f.status === 'success');

  return {
    files,
    isUploading,
    isGeneratingUrls,
    dragActive,
    error,
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

// Re-export types for convenience
export type { UploadFile };
