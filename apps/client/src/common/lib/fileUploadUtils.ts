/**
 * File upload utility functions
 */

import {
  CHUNK_SIZE,
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_CONCURRENCY,
} from '../constants';

// Re-export constants for backward compatibility
export {
  CHUNK_SIZE,
  DEFAULT_MAX_FILES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_CONCURRENCY,
};

/**
 * Split a file into chunks for multipart upload
 */
export function splitFileIntoChunks(
  file: File,
  chunkSize: number = CHUNK_SIZE
): Blob[] {
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

/**
 * Generate a unique file ID
 */
export function generateFileId(): string {
  return Math.random().toString(36).slice(2, 11);
}

/**
 * Validate a file for upload
 * @param file - The file to validate
 * @param maxFileSize - Maximum file size in bytes
 * @returns Error message if invalid, null if valid
 */
export function validateFile(file: File, maxFileSize: number): string | null {
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
}

/**
 * Concurrency queue for executing tasks with a limit
 */
export class ConcurrencyQueue {
  private queue: Array<() => Promise<void>> = [];
  private running: number = 0;
  private concurrency: number;

  constructor(concurrency: number) {
    this.concurrency = concurrency;
  }

  /**
   * Add a task to the queue
   */
  async execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      this.queue.push(wrappedTask);
      this.process();
    });
  }

  /**
   * Process the queue
   */
  private process(): void {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    this.running++;
    const task = this.queue.shift();

    if (task) {
      task().finally(() => {
        this.running--;
        this.process();
      });
    }
  }

  /**
   * Execute multiple tasks with concurrency control
   */
  static async executeWithConcurrency<T>(
    tasks: Array<() => Promise<T>>,
    concurrency: number
  ): Promise<T[]> {
    const queue = new ConcurrencyQueue(concurrency);
    return Promise.all(tasks.map(task => queue.execute(task)));
  }
}

