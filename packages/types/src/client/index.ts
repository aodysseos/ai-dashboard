// Client-specific types (UI models, component props, etc.)

import { User, DashboardMetrics } from '../api';

// UI Component types
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  sortBy?: keyof T;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: keyof T) => void;
}

// Dashboard component types
export interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: Date;
}

export interface ChartProps {
  data: ChartDataPoint[];
  type?: 'line' | 'bar' | 'pie';
  height?: number;
  width?: number;
}

// Form types
export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  error?: string;
  options?: { label: string; value: string }[];
}

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavigationItem[];
}

export interface SidebarProps {
  items: NavigationItem[];
  collapsed?: boolean;
  onToggle?: () => void;
}

// User interface types
export interface UserProfile extends User {
  avatar?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
  };
}

// State management types
export interface AppState {
  user: UserProfile | null;
  theme: 'light' | 'dark' | 'system';
  sidebar: {
    collapsed: boolean;
  };
  dashboard: {
    metrics: DashboardMetrics | null;
    loading: boolean;
    lastUpdated: Date | null;
  };
}

// Theme types
export interface ThemeConfig {
  name: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    accent: string;
  };
}

// Dashboard table data types
export interface DashboardData {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  revenue: number;
  growth: number;
  lastUpdated: string;
}
