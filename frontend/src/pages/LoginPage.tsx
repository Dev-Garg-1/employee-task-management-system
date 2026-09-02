import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        'Authentication failed. Please check your credentials.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full">
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/25 mb-4">
            <CheckSquare className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Employee Task Flow
          </h1>
          <p className="mt-2 text-sm text-indigo-200/80">
            Sign in to access your tasks and dashboard
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200/80 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm text-rose-700">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">
              Quick Demo Fill
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@example.com', 'Admin@123')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100 text-left transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-indigo-900 truncate">Admin</p>
                  <p className="text-[10px] text-indigo-600 truncate">admin@example.com</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('john.doe@example.com', 'Employee@123')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 text-left transition-colors"
              >
                <User className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-emerald-900 truncate">Employee</p>
                  <p className="text-[10px] text-emerald-600 truncate">john.doe@example.com</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Demo Credentials Footer Info */}
        <div className="mt-6 text-center text-xs text-indigo-200/60">
          Academic Project • .NET 10 Web API & React Vite
        </div>
      </div>
    </div>
  );
};
