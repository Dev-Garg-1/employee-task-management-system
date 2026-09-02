export type Role = 'Admin' | 'Employee';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  employeeId?: number | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  isActive: boolean;
  createdAt: string;
  totalTasks?: number;
  pendingTasks?: number;
  inProgressTasks?: number;
  completedTasks?: number;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedEmployeeId: number;
  assignedEmployeeName: string;
  assignedEmployeeEmail?: string;
  createdById?: number | null;
  createdByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  department: string;
  designation: string;
  password?: string;
}

export interface UpdateEmployeePayload {
  name: string;
  email: string;
  department: string;
  designation: string;
  isActive: boolean;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedEmployeeId: number;
}

export interface UpdateTaskPayload {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assignedEmployeeId: number;
}

export interface AdminDashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  recentTasks: TaskItem[];
}

export interface EmployeeDashboardStats {
  myTotalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  recentTasks: TaskItem[];
}
