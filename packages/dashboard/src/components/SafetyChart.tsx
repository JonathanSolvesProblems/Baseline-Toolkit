import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { DashboardData, FilterOptions } from '../types';

interface SafetyChartProps {
  data: DashboardData;
  filters: FilterOptions;
}

const COLORS = {
  safe: '#22c55e',
  low: '#f59e0b',
  false: '#ef4444',
};

export function SafetyChart({ data, filters }: SafetyChartProps) {
  const pieData = [
    { name: 'Safe Features', value: data.safeFeatures, color: COLORS.safe },
    { name: 'Baseline Low', value: Math.floor(data.riskyFeatures * 0.6), color: COLORS.low },
    { name: 'Not Baseline', value: Math.ceil(data.riskyFeatures * 0.4), color: COLORS.false },
  ].filter((item) => {
    if (item.name === 'Safe Features') return filters.showSafe;
    if (item.name === 'Baseline Low') return filters.showLow;
    if (item.name === 'Not Baseline') return filters.showFalse;
    return true;
  });

  const barData = data.reports.map((report) => ({
    name: report.file.split('/').pop()?.substring(0, 15) + '...' || report.file,
    safe: report.report.safe,
    risky: report.report.risky.length,
    score: report.report.safetyScore,
  }));

  return (
    <div className="space-y-8">
      {/* Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Feature Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Safety Score */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Overall Safety Score</h3>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={
                      data.safetyScore >= 80
                        ? COLORS.safe
                        : data.safetyScore >= 60
                          ? COLORS.low
                          : COLORS.false
                    }
                    strokeWidth="8"
                    strokeDasharray={`${(data.safetyScore / 100) * 314} 314`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{data.safetyScore}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {data.safeFeatures} of {data.totalFeatures} features are safe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Per-File Analysis</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} angle={-45} textAnchor="end" height={80} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="safe" fill={COLORS.safe} name="Safe Features" />
              <Bar dataKey="risky" fill={COLORS.low} name="Risky Features" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
