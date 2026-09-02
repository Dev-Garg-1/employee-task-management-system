import axios from 'axios';
import {
  AuthResponse,
  Employee,
  CreateEmployeePayload,
  UpdateEmployeePayload,
  TaskItem,
  CreateTaskPayload,
  UpdateTaskPayload,
  AdminDashboardStats,
  EmployeeDashboardStats
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Employees endpoints
export const employeesApi = {
  getAll: async (params?: { activeOnly?: boolean; search?: string }): Promise<Employee[]> => {
    const res = await api.get<Employee[]>('/employees', { params });
    return res.data;
  },
  getById: async (id: number): Promise<Employee> => {
    const res = await api.get<Employee>(`/employees/${id}`);
    return res.data;
  },
  create: async (data: CreateEmployeePayload): Promise<Employee> => {
    const res = await api.post<Employee>('/employees', data);
    return res.data;
  },
  update: async (id: number, data: UpdateEmployeePayload): Promise<Employee> => {
    const res = await api.put<Employee>(`/employees/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<{ message: string; employeeId: number; isActive: boolean }> => {
    const res = await api.delete(`/employees/${id}`);
    return res.data;
  },
};

// Tasks endpoints
export const tasksApi = {
  getAll: async (params?: { employeeId?: number; status?: string; priority?: string; search?: string }): Promise<TaskItem[]> => {
    const res = await api.get<TaskItem[]>('/tasks', { params });
    return res.data;
  },
  getById: async (id: number): Promise<TaskItem> => {
    const res = await api.get<TaskItem>(`/tasks/${id}`);
    return res.data;
  },
  create: async (data: CreateTaskPayload): Promise<TaskItem> => {
    const res = await api.post<TaskItem>('/tasks', data);
    return res.data;
  },
  update: async (id: number, data: UpdateTaskPayload): Promise<TaskItem> => {
    const res = await api.put<TaskItem>(`/tasks/${id}`, data);
    return res.data;
  },
  updateStatus: async (id: number, status: string): Promise<TaskItem> => {
    const res = await api.patch<TaskItem>(`/tasks/${id}/status`, { status });
    return res.data;
  },
  delete: async (id: number): Promise<{ message: string; taskId: number }> => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  },
};

// Dashboard endpoint
export const dashboardApi = {
  getStats: async (): Promise<AdminDashboardStats | EmployeeDashboardStats> => {
    const res = await api.get('/dashboard');
    return res.data;
  },
};

export default api;
