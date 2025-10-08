// API-specific types (DTOs, responses, requests)

import { BaseEntity, ApiResponse, PaginatedResponse } from '../core';

// Upload related types
export interface PresignedUrlRequest {
  filename: string;
  size: number;
  contentType: string;
}

export interface PresignedUrlResponse {
  key: string;
  uploadUrl: string;
  expiresAt: string;
}

export interface UploadRequest {
  files: PresignedUrlRequest[];
}

export interface UploadResponse {
  uploads: PresignedUrlResponse[];
}

export interface UploadError {
  code: string;
  message: string;
  field?: string;
}

// Multipart upload types
export interface MultipartUploadInitiateRequest {
  filename: string;
  contentType: string;
  size: number;
}

export interface MultipartUploadInitiateResponse {
  uploadId: string;
  key: string;
}

export interface MultipartUploadPartRequest {
  uploadId: string;
  key: string;
  partNumber: number;
}

export interface MultipartUploadPartResponse {
  partNumber: number;
  uploadUrl: string;
  expiresAt: string;
}

export interface MultipartUploadCompleteRequest {
  uploadId: string;
  key: string;
  parts: Array<{
    partNumber: number;
    etag: string;
  }>;
}

export interface MultipartUploadCompleteResponse {
  location: string;
  etag: string;
}

// Health check types
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  services?: {
    database?: 'connected' | 'disconnected';
    cache?: 'connected' | 'disconnected';
  };
}

// Dashboard metrics types
export interface DashboardMetrics {
  totalRevenue: number;
  newCustomers: number;
  activeAccounts: number;
  growthRate: number;
  period: string;
  lastUpdated: Date;
}

export type DashboardMetricsResponse = ApiResponse<DashboardMetrics>;

// User types (for future use)
export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export type UserRole = 'admin' | 'user' | 'viewer';

export type UserResponse = ApiResponse<User>;
export type UsersResponse = PaginatedResponse<User>;

// Request types
export interface CreateUserRequest {
  email: string;
  name: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: UserRole;
  status?: 'active' | 'inactive';
}

// API endpoints types
export interface ApiEndpoints {
  health: '/health';
  api: '/api';
  users: '/api/users';
  dashboard: '/api/dashboard';
  metrics: '/api/dashboard/metrics';
}
