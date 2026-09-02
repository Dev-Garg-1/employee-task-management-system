import React, { useEffect, useState } from 'react';
import { tasksApi, employeesApi } from '../services/api';
import { TaskItem, Employee, CreateTaskPayload, UpdateTaskPayload, TaskPriority, TaskStatus } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';
import {
  CheckSquare,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Filter
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Forms
  const [formData, setFormData] = useState<CreateTaskPayload>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedEmployeeId: 0,
  });

  const [editFormData, setEditFormData] = useState<UpdateTaskPayload>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '',
    assignedEmployeeId: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployeesList = async () => {
    try {
      const data = await employeesApi.getAll({ activeOnly: true });
      setEmployees(data);
      if (data.length > 0 && formData.assignedEmployeeId === 0) {
        setFormData((prev) => ({ ...prev, assignedEmployeeId: data[0].id }));
      }
    } catch {
      // Handled silently
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getAll({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        employeeId: employeeFilter ? parseInt(employeeFilter) : undefined,
      });
      setTasks(data);
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesList();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter, employeeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks();
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const validateForm = (data: CreateTaskPayload | UpdateTaskPayload): boolean => {
    const errors: Record<string, string> = {};
    if (!data.title.trim()) {
      errors.title = 'Task title is required.';
    }
    if (!data.dueDate) {
      errors.dueDate = 'Due date is required.';
    }
    if (!data.assignedEmployeeId || data.assignedEmployeeId <= 0) {
      errors.assignedEmployeeId = 'Please assign an employee.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Create
  const handleOpenAdd = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedEmployeeId: employees.length > 0 ? employees[0].id : 0,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(formData)) return;

    try {
      setSubmitting(true);
      await tasksApi.create({
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
      });
      setIsAddModalOpen(false);
      showNotification('success', `Task "${formData.title}" created successfully.`);
      fetchTasks();
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit
  const handleOpenEdit = (task: TaskItem) => {
    setSelectedTask(task);
    const dateFormatted = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
    setEditFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: dateFormatted,
      assignedEmployeeId: task.assignedEmployeeId,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    if (!validateForm(editFormData)) return;

    try {
      setSubmitting(true);
      await tasksApi.update(selectedTask.id, {
        ...editFormData,
        dueDate: new Date(editFormData.dueDate).toISOString(),
      });
      setIsEditModalOpen(false);
      showNotification('success', `Task "${editFormData.title}" updated successfully.`);
      fetchTasks();
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to update task.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Status Update from Table
  const handleQuickStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await tasksApi.updateStatus(taskId, newStatus);
      showNotification('success', `Task status changed to "${newStatus}".`);
      fetchTasks();
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Delete
  const handleOpenDelete = (task: TaskItem) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask) return;

    try {
      setSubmitting(true);
      await tasksApi.delete(selectedTask.id);
      setIsDeleteModalOpen(false);
      showNotification('success', `Task "${selectedTask.title}" has been deleted.`);
      fetchTasks();
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to delete task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, assign, monitor, and organize workflow tasks across all employees
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 border animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-medium">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks by title, description, or assigned employee..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-medium transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            Filters:
          </span>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Employee filter */}
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.department})
              </option>
            ))}
          </select>

          {(search || statusFilter || priorityFilter || employeeFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPriorityFilter('');
                setEmployeeFilter('');
              }}
              className="text-indigo-600 hover:text-indigo-700 underline font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading tasks...</p>
          </div>
        ) : tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Task Details</th>
                  <th className="px-6 py-3.5">Assigned Employee</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{task.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 max-w-md">
                          {task.description || 'No description provided'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-xs">{task.assignedEmployeeName}</p>
                          {task.assignedEmployeeEmail && (
                            <p className="text-[10px] text-slate-400">{task.assignedEmployeeEmail}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Status Dropdown */}
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleQuickStatusChange(task.id, e.target.value as TaskStatus)
                        }
                        className="text-xs font-medium px-2 py-1 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(task)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(task)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No tasks found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search filters or create a new task.
            </p>
          </div>
        )}
      </div>

      {/* Modal: Create Task */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Task" maxWidth="lg">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement OAuth 2.0 Client Credentials flow"
              className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                formErrors.title
                  ? 'border-rose-300 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
            {formErrors.title && <p className="text-[11px] text-rose-600 mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description and acceptance criteria for the assigned employee..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Assign Employee *
            </label>
            <select
              value={formData.assignedEmployeeId}
              onChange={(e) =>
                setFormData({ ...formData, assignedEmployeeId: parseInt(e.target.value) })
              }
              className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                formErrors.assignedEmployeeId
                  ? 'border-rose-300 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.designation} ({emp.department})
                </option>
              ))}
            </select>
            {formErrors.assignedEmployeeId && (
              <p className="text-[11px] text-rose-600 mt-1">{formErrors.assignedEmployeeId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as TaskPriority })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as TaskStatus })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                  formErrors.dueDate
                    ? 'border-rose-300 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              {formErrors.dueDate && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.dueDate}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-70"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Task */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Task" maxWidth="lg">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Assigned Employee *
            </label>
            <select
              value={editFormData.assignedEmployeeId}
              onChange={(e) =>
                setEditFormData({ ...editFormData, assignedEmployeeId: parseInt(e.target.value) })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.designation} ({emp.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={editFormData.priority}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, priority: e.target.value as TaskPriority })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Status
              </label>
              <select
                value={editFormData.status}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, status: e.target.value as TaskStatus })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={editFormData.dueDate}
                onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-70"
            >
              {submitting ? 'Saving...' : 'Update Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete Task */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Task" maxWidth="sm">
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to permanently delete task:
            <br />
            <strong className="text-slate-900 mt-1 inline-block">"{selectedTask?.title}"</strong>?
          </p>
          <p className="text-[11px] text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleConfirmDelete}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {submitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
