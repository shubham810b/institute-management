import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'purple' | 'green' | 'amber' | 'rose';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
  onClick,
}) => {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100 hover:border-blue-300',
      ring: 'focus:ring-blue-500',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100 hover:border-purple-300',
      ring: 'focus:ring-purple-500',
    },
    green: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100 hover:border-emerald-300',
      ring: 'focus:ring-emerald-500',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100 hover:border-amber-300',
      ring: 'focus:ring-amber-500',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100 hover:border-rose-300',
      ring: 'focus:ring-rose-500',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all duration-200 hover:shadow-md ${style.border} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${style.bg} flex-shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center text-xs">
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.value}
          </span>
          <span className="ml-1.5 text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};
