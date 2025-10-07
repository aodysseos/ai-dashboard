// API-specific types (DTOs, responses, requests)

import { BaseEntity, ApiResponse, PaginatedResponse } from '../core';

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
