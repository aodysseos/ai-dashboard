import { useQuery } from '@tanstack/react-query'
import type { ApiResponse, HealthCheckResponse } from '@workspace/types'

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Generic API fetch function
async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`)
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

// Health check hook
export function useHealthCheck() {
  return useQuery<HealthCheckResponse>({
    queryKey: ['health'],
    queryFn: () => fetchApi<HealthCheckResponse>('/health'),
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  })
}

// API status hook
export function useApiStatus() {
  return useQuery<ApiResponse>({
    queryKey: ['api-status'],
    queryFn: () => fetchApi<ApiResponse>('/api'),
    refetchInterval: 60000, // Refetch every minute
  })
}
