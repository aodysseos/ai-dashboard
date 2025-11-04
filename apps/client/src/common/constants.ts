/**
 * Application constants
 */

// API polling intervals (in milliseconds)
export const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
export const API_STATUS_INTERVAL = 60000; // 60 seconds (1 minute)
export const HEALTH_CHECK_STALE_TIME = 10000; // 10 seconds

// File upload constants
export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
export const DEFAULT_MAX_FILES = 200;
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DEFAULT_CONCURRENCY = 5;

// UI strings
export const NO_RESULTS_TEXT = 'No results.';
export const UPLOADING_TEXT = 'Uploading...';
export const PREPARING_TEXT = 'Preparing...';

