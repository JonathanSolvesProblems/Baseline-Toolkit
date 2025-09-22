import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import type { TrendData } from '../types';

interface OverviewCardProps {
  title: string;
  value: string | number;
  icon: typeof LucideIcon;
  subtitle?: string;
  trend?: TrendData;
  color?: 'default' | 'success' | 'warning' | 'error';
}

export function OverviewCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = 'default',
}: OverviewCardProps) {
  const colorStyles = {
    default: 'text-gray-600 bg-gray-50',
    success: 'text-success-600 bg-success-50',
    warning: 'text-warning-600 bg-warning-50',
    error: 'text-error-600 bg-error-50',
  };

  return (
    <div className="card">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${colorStyles[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {subtitle && <p className="ml-2 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {trend && (
            <div className="flex items-center mt-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-success-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-error-500" />
              )}
              <span
                className={`ml-1 text-sm ${
                  trend.isPositive ? 'text-success-600' : 'text-error-600'
                }`}
              >
                {trend.value}%
              </span>
              <span className="ml-1 text-sm text-gray-500">vs last scan</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
