import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose' | 'purple';
  subtitle?: string;
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-100',
    ring: 'focus:ring-indigo-500',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    ring: 'focus:ring-emerald-500',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-100',
    ring: 'focus:ring-amber-500',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-100',
    ring: 'focus:ring-blue-500',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-100',
    ring: 'focus:ring-rose-500',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-100',
    ring: 'focus:ring-purple-500',
  },
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle }) => {
  const styles = colorMap[color];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-xl ${styles.bg} ${styles.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
