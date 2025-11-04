/**
 * Centralized API configuration and utilities
 */

import { getApiBaseUrl } from './env';

/**
 * API base URL constant
 */
export const API_BASE_URL = getApiBaseUrl();

/**
 * Generic API fetch function
 * @param endpoint - The API endpoint to call
 * @param options - Optional fetch options (method, headers, body, etc.)
 * @returns Promise resolving to the response data
 * @throws Error if the API request fails
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.errors?.[0]?.message) {
        errorMessage = errorData.errors[0].message;
      }
    } catch {
      // If error response is not JSON, use default message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

