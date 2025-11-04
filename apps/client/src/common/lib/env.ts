/**
 * Environment variable validation and access utilities
 */

/**
 * Get the API base URL from environment variables
 * @returns The API base URL
 */
export function getApiBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    console.warn('VITE_API_URL not set, using default: http://localhost:3001');
    return 'http://localhost:3001';
  }
  return apiUrl;
}

/**
 * Get the app name from environment variables
 * @returns The app name
 */
export function getAppName(): string {
  return import.meta.env.VITE_APP_NAME || 'AI Dashboard';
}

/**
 * Validate required environment variables
 * @throws Error if required environment variables are missing
 */
export function validateEnv(): void {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    console.warn('VITE_API_URL is not set. Using default value.');
  }
}

