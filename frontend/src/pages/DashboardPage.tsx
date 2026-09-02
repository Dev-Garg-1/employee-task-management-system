import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, tasksApi } from '../services/api';
import { AdminDashboardStats, EmployeeDashboardStats, TaskItem } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  Users,
  UserCheck,
  CheckSquare,
  Clock,
  PlayCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | EmployeeDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      setStatusUpdatingId(taskId);
      await tasksApi.updateStatus(taskId, newStatus);
      await fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update task status.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold text-rose-900">Dashboard Error</h3>
          <p className="text-xs text-rose-700 mt-1">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const adminStats = isAdmin ? (stats as AdminDashboardStats) : null;
  const employeeStats = !isAdmin ? (stats as EmployeeDashboardStats) : null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Here is the high-level overview of company employees and assigned tasks.'
              : 'Here is an overview of tasks currently assigned to you.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </Link>
            <Link
              to="/employees"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Manage Employees</span>
            </Link>
          </div>
        )}
      </div>

      {/* Admin KPI Cards */}
      {isAdmin && adminStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Employees"
            value={adminStats.totalEmployees}
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="Active Employees"
            value={adminStats.activeEmployees}
            icon={UserCheck}
            color="emerald"
          />
          <StatCard
            title="Total Tasks"
            value={adminStats.totalTasks}
            icon={CheckSquare}
            color="purple"
          />
          <StatCard
            title="Pending"
            value={adminStats.pendingTasks}
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="In Progress"
            value={adminStats.inProgressTasks}
            icon={PlayCircle}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={adminStats.completedTasks}
            icon={CheckCircle2}
            color="emerald"
          />
        </div>
      )}

      {/* Employee KPI Cards */}
      {!isAdmin && employeeStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Total Tasks"
            value={employeeStats.myTotalTasks}
            icon={CheckSquare}
            color="indigo"
          />
          <StatCard
            title="Pending Tasks"
            value={employeeStats.pendingTasks}
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="In Progress"
            value={employeeStats.inProgressTasks}
            icon={PlayCircle}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={employeeStats.completedTasks}
            icon={CheckCircle2}
            color="emerald"
          />
        </div>
      )}

      {/* Recent Tasks Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isAdmin ? 'Recent Company Tasks' : 'Recent Tasks Assigned To You'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest tasks created or updated in the system
            </p>
          </div>
          <Link
            to={isAdmin ? '/tasks' : '/my-tasks'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats?.recentTasks && stats.recentTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Task</th>
                  {isAdmin && <th className="px-6 py-3.5">Assigned To</th>}
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  {!isAdmin && <th className="px-6 py-3.5 text-right">Quick Status</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentTasks.map((task: TaskItem) => (
                  <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{task.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {task.description || 'No description provided'}
                        </p>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {task.assignedEmployeeName}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    {!isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1">
                          {task.status !== 'In Progress' && (
                            <button
                              disabled={statusUpdatingId === task.id}
                              onClick={() => handleStatusChange(task.id, 'In Progress')}
                              className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                            >
                              In Progress
                            </button>
                          )}
                          {task.status !== 'Completed' && (
                            <button
                              disabled={statusUpdatingId === task.id}
                              onClick={() => handleStatusChange(task.id, 'Completed')}
                              className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                            >
                              Completed
                            </button>
                          )}
                          {task.status !== 'Pending' && (
                            <button
                              disabled={statusUpdatingId === task.id}
                              onClick={() => handleStatusChange(task.id, 'Pending')}
                              className="px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                            >
                              Pending
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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
              {isAdmin ? 'Create your first task using the button above.' : 'No tasks assigned to you yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
