import React from 'react';
import { TaskStatus } from '../types';
import { Clock, CheckCircle2, PlayCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus | string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showIcon = true }) => {
  switch (status) {
    case 'Completed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${className}`}>
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          Completed
        </span>
      );
    case 'In Progress':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 ${className}`}>
          {showIcon && <PlayCircle className="w-3.5 h-3.5 text-blue-600" />}
          In Progress
        </span>
      );
    case 'Pending':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 ${className}`}>
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600" />}
          Pending
        </span>
      );
  }
};
