import React from 'react';
import { TaskPriority } from '../types';
import { AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TaskPriority | string;
  className?: string;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '', showIcon = true }) => {
  switch (priority) {
    case 'High':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}>
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
          High
        </span>
      );
    case 'Low':
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 ${className}`}>
          {showIcon && <ArrowDown className="w-3.5 h-3.5 text-slate-500" />}
          Low
        </span>
      );
    case 'Medium':
    default:
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${className}`}>
          {showIcon && <ArrowUp className="w-3.5 h-3.5 text-indigo-600" />}
          Medium
        </span>
      );
  }
};
