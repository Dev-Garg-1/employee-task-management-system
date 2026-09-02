import React, { useEffect, useState } from 'react';
import { employeesApi } from '../services/api';
import { Employee, CreateEmployeePayload, UpdateEmployeePayload } from '../types';
import { Modal } from '../components/Modal';
import {
  Users,
  Plus,
  Search,
  Edit2,
  UserX,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  Mail,
  Filter
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateEmployeePayload>({
    name: '',
    email: '',
    department: '',
    designation: '',
    password: '',
  });

  const [editFormData, setEditFormData] = useState<UpdateEmployeePayload>({
    name: '',
    email: '',
    department: '',
    designation: '',
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeesApi.getAll({
        activeOnly: filterActiveOnly,
        search: search.trim() || undefined,
      });
      setEmployees(data);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch employees list.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [filterActiveOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees();
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Validation
  const validateForm = (data: CreateEmployeePayload | UpdateEmployeePayload): boolean => {
    const errors: Record<string, string> = {};
    if (!data.name.trim() || data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }
    if (!data.email.trim() || !/^\S+@\S+\.\S+$/.test(data.email)) {
      errors.email = 'Valid email address is required.';
    }
    if (!data.department.trim()) {
      errors.department = 'Department is required.';
    }
    if (!data.designation.trim()) {
      errors.designation = 'Designation is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create Employee
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      designation: '',
      password: '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm(formData)) return;

    try {
      setSubmitting(true);
      await employeesApi.create(formData);
      setIsAddModalOpen(false);
      showNotification('success', `Employee "${formData.name}" added successfully.`);
      fetchEmployees();
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to create employee.');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Employee
  const handleOpenEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setEditFormData({
      name: emp.name,
      email: emp.email,
      department: emp.department,
      designation: emp.designation,
      isActive: emp.isActive,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    if (!validateForm(editFormData)) return;

    try {
      setSubmitting(true);
      await employeesApi.update(selectedEmployee.id, editFormData);
      setIsEditModalOpen(false);
      showNotification('success', `Employee "${editFormData.name}" updated successfully.`);
      fetchEmployees();
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to update employee.');
    } finally {
      setSubmitting(false);
    }
  };

  // Deactivate Employee
  const handleOpenDeactivate = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedEmployee) return;

    try {
      setSubmitting(true);
      if (selectedEmployee.isActive) {
        await employeesApi.delete(selectedEmployee.id);
        showNotification('success', `Employee "${selectedEmployee.name}" has been deactivated.`);
      } else {
        // Toggle reactivate
        await employeesApi.update(selectedEmployee.id, {
          name: selectedEmployee.name,
          email: selectedEmployee.email,
          department: selectedEmployee.department,
          designation: selectedEmployee.designation,
          isActive: true,
        });
        showNotification('success', `Employee "${selectedEmployee.name}" has been reactivated.`);
      }
      setIsDeleteModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage organization staff members, roles, and status
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Employee</span>
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

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department, or designation..."
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

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setFilterActiveOnly(!filterActiveOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              filterActiveOnly
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterActiveOnly ? 'Active Only (Filtered)' : 'Show All Employees'}</span>
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Loading employees list...</p>
          </div>
        ) : employees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Designation</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Assigned Tasks</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{emp.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.designation}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emp.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-800">{emp.totalTasks ?? 0}</span>
                        <span className="text-slate-400">tasks</span>
                        {(emp.pendingTasks ?? 0) > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            {emp.pendingTasks} pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeactivate(emp)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            emp.isActive
                              ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={emp.isActive ? 'Deactivate Employee' : 'Reactivate Employee'}
                        >
                          {emp.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No employees found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or add a new employee.
            </p>
          </div>
        )}
      </div>

      {/* Modal: Add Employee */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Employee">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alex Rivera"
              className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                formErrors.name
                  ? 'border-rose-300 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
            {formErrors.name && <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. alex.rivera@example.com"
              className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                formErrors.email
                  ? 'border-rose-300 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
            {formErrors.email && <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Engineering"
                className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                  formErrors.department
                    ? 'border-rose-300 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              {formErrors.department && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Designation *
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Frontend Dev"
                className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                  formErrors.designation
                    ? 'border-rose-300 focus:ring-rose-500/20'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
              {formErrors.designation && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.designation}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Initial Login Password (Optional)
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Defaults to: Employee@123"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              A login account will automatically be configured for this employee.
            </p>
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
              {submitting ? 'Adding...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Employee */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Employee">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                required
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Designation *
              </label>
              <input
                type="text"
                required
                value={editFormData.designation}
                onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editFormData.isActive}
                onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span className="text-xs font-medium text-slate-700">Active Employee Status</span>
            </label>
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
              {submitting ? 'Saving...' : 'Update Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Deactivate Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={selectedEmployee?.isActive ? 'Deactivate Employee' : 'Reactivate Employee'}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to{' '}
            <strong className="text-slate-900">
              {selectedEmployee?.isActive ? 'deactivate' : 'reactivate'}
            </strong>{' '}
            the account for <strong>{selectedEmployee?.name}</strong>?
          </p>

          {selectedEmployee?.isActive && (
            <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              Deactivated employees will be prevented from logging in and assigning new tasks.
            </p>
          )}

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
              onClick={handleConfirmDeactivate}
              className={`px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold shadow-sm transition-colors ${
                selectedEmployee?.isActive
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {submitting
                ? 'Processing...'
                : selectedEmployee?.isActive
                ? 'Confirm Deactivation'
                : 'Confirm Reactivation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
