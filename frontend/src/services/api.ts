import axios, { AxiosError } from 'axios';
import {
  AuthResponse,
  User,
  Goal,
  Task,
  DashboardData,
  StreakSummary,
  HistoryResponse,
  AnalyticsData,
} from '../types';

const api = axios.create({
  baseURL: 'https://tdo-rt2t.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tdo_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('tdo_token');
      localStorage.removeItem('tdo_user');
      window.dispatchEvent(new Event('tdo_auth_reset'));
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

export const userService = {
  getProfile: () => api.get<User>('/users/me'),
  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    api.put<User>('/users/me', data),
};

export const goalService = {
  list: (status?: string) =>
    api.get<Goal[]>('/goals', { params: { status } }),
  get: (id: number) => api.get<Goal>(`/goals/${id}`),
  create: (data: Partial<Goal>) => api.post<Goal>('/goals', data),
  update: (id: number, data: Partial<Goal>) => api.put<Goal>(`/goals/${id}`, data),
  delete: (id: number) => api.delete(`/goals/${id}`),
};

export const taskService = {
  list: (params?: {
    status?: string;
    priority?: string;
    category?: string;
    goal_id?: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }) => api.get<Task[]>('/tasks', { params }),
  get: (id: number) => api.get<Task>(`/tasks/${id}`),
  create: (data: Partial<Task>) => api.post<Task>('/tasks', data),
  update: (id: number, data: Partial<Task>) => api.put<Task>(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  complete: (id: number) => api.post<Task>(`/tasks/${id}/complete`),
  uncomplete: (id: number) => api.post<Task>(`/tasks/${id}/uncomplete`),
};

export const dashboardService = {
  get: () => api.get<DashboardData>('/dashboard'),
};

export const streakService = {
  get: () => api.get<StreakSummary>('/streaks'),
};

export const historyService = {
  get: (params?: {
    period?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    category?: string;
  }) => api.get<HistoryResponse>('/history', { params }),
};

export const analyticsService = {
  get: (days: number = 30) =>
    api.get<AnalyticsData>('/analytics', { params: { days } }),
};

export default api;
