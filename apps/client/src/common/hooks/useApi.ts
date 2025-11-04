import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, HealthCheckResponse } from '@workspace/types';
import { fetchApi } from '../lib/api';
import {
  HEALTH_CHECK_INTERVAL,
  API_STATUS_INTERVAL,
  HEALTH_CHECK_STALE_TIME,
} from '../constants';

/**
 * Health check hook
 * @returns React Query hook for health check endpoint
 */
export function useHealthCheck() {
  return useQuery<HealthCheckResponse>({
    queryKey: ['health'],
    queryFn: () => fetchApi<HealthCheckResponse>('/health'),
    refetchInterval: HEALTH_CHECK_INTERVAL,
    staleTime: HEALTH_CHECK_STALE_TIME,
  });
}

/**
 * API status hook
 * @returns React Query hook for API status endpoint
 */
export function useApiStatus() {
  return useQuery<ApiResponse>({
    queryKey: ['api-status'],
    queryFn: () => fetchApi<ApiResponse>('/api'),
    refetchInterval: API_STATUS_INTERVAL,
  });
}
