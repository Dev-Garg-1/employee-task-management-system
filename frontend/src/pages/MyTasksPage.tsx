import React, { useEffect, useState } from 'react';
import { tasksApi } from '../services/api';
import { TaskItem, TaskStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';
import {
  ListTodo,
  Search,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';

export const MyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksApi.getAll({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setTasks(data);
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to load assigned tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMyTasks();
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleStatusUpdate = async (taskId: number, newStatus: TaskStatus) => {
    try {
      setUpdatingId(taskId);
      const updated = await tasksApi.updateStatus(taskId, newStatus);
      showNotification('success', `Status updated to "${newStatus}".`);

      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updated);
      }
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to update task status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDetail = (task: TaskItem) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Assigned Tasks</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and update progress for tasks assigned to you
          </p>
        </div>
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

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or task details..."
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

          {(search || statusFilter || priorityFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="text-indigo-600 hover:text-indigo-700 underline font-medium ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading your tasks...</p>
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{task.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">
                  {task.description || 'No detailed instructions provided.'}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Due:{' '}
                      {new Date(task.dueDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenDetail(task)}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                </div>

                {/* Direct Status Transition Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    disabled={updatingId === task.id || task.status === 'Pending'}
                    onClick={() => handleStatusUpdate(task.id, 'Pending')}
                    className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                      task.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                        : 'bg-amber-50/50 text-amber-700 border-amber-200/70 hover:bg-amber-100'
                    }`}
                  >
                    Pending
                  </button>

                  <button
                    disabled={updatingId === task.id || task.status === 'In Progress'}
                    onClick={() => handleStatusUpdate(task.id, 'In Progress')}
                    className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                      task.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold'
                        : 'bg-blue-50/50 text-blue-700 border-blue-200/70 hover:bg-blue-100'
                    }`}
                  >
                    In Progress
                  </button>

                  <button
                    disabled={updatingId === task.id || task.status === 'Completed'}
                    onClick={() => handleStatusUpdate(task.id, 'Completed')}
                    className={`px-2 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                      task.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-emerald-50/50 text-emerald-700 border-emerald-200/70 hover:bg-emerald-100'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
          <ListTodo className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No tasks assigned</p>
          <p className="text-xs text-slate-400 mt-1">
            You currently have no tasks assigned matching your filters.
          </p>
        </div>
      )}

      {/* Modal: Task Detail View */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Task Overview"
        maxWidth="md"
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Task Title
              </span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">{selectedTask.title}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Priority
                </span>
                <div className="mt-1">
                  <PriorityBadge priority={selectedTask.priority} />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={selectedTask.status} />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Due Date
                </span>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  {new Date(selectedTask.dueDate).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Created By
                </span>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  {selectedTask.createdByName || 'Administrator'}
                </p>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Description & Instructions
              </span>
              <div className="mt-1 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedTask.description || 'No additional instructions provided for this task.'}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Update Status
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(['Pending', 'In Progress', 'Completed'] as TaskStatus[]).map((status) => (
                  <button
                    key={status}
                    disabled={selectedTask.status === status}
                    onClick={() => handleStatusUpdate(selectedTask.id, status)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      selectedTask.status === status
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
