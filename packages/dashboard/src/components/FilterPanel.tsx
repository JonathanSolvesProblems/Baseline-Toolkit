import { Filter } from 'lucide-react';
import type { FilterOptions } from '../types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const handleToggle = (key: keyof FilterOptions) => {
    onFiltersChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  return (
    <div className="flex items-center space-x-4">
      <Filter className="h-4 w-4 text-gray-500" />
      <div className="flex items-center space-x-3">
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={filters.showSafe}
            onChange={() => handleToggle('showSafe')}
            className="rounded border-gray-300 text-success-600 focus:ring-success-500"
          />
          <span className="text-gray-700">Safe</span>
        </label>
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={filters.showLow}
            onChange={() => handleToggle('showLow')}
            className="rounded border-gray-300 text-warning-600 focus:ring-warning-500"
          />
          <span className="text-gray-700">Baseline Low</span>
        </label>
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={filters.showFalse}
            onChange={() => handleToggle('showFalse')}
            className="rounded border-gray-300 text-error-600 focus:ring-error-500"
          />
          <span className="text-gray-700">Not Baseline</span>
        </label>
      </div>
    </div>
  );
}
