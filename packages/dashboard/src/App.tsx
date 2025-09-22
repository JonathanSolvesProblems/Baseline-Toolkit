import { useState, useEffect } from 'react';
import { Shield, FileText, AlertTriangle, CheckCircle, TrendingUp, Settings } from 'lucide-react';
import { OverviewCard } from './components/OverviewCard';
import { SafetyChart } from './components/SafetyChart';
import { RiskyFeaturesList } from './components/RiskyFeaturesList';
import { FileReportsList } from './components/FileReportsList';
import { FilterPanel } from './components/FilterPanel';
import type { DashboardData, FilterOptions } from './types';

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    showSafe: true,
    showLow: true,
    showFalse: true,
  });

  useEffect(() => {
    // Load sample data (in production, this would come from the CLI report)
    loadSampleData();
  }, []);

  const loadSampleData = async (): Promise<void> => {
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const sampleData: DashboardData = {
      totalFiles: 24,
      totalFeatures: 156,
      safeFeatures: 132,
      riskyFeatures: 24,
      safetyScore: 85,
      reports: [
        {
          file: 'src/components/Header.tsx',
          report: {
            safe: 8,
            risky: [
              {
                id: 'css-container-queries',
                baseline: 'low',
                support: { chrome: '105', firefox: '110', safari: '16.0' },
                name: 'CSS Container Queries',
                mdn: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries',
              },
            ],
            total: 9,
            safetyScore: 89,
          },
        },
        {
          file: 'src/utils/api.ts',
          report: {
            safe: 12,
            risky: [
              {
                id: 'idle-detection',
                baseline: false,
                support: { chrome: '84' },
                name: 'Idle Detection API',
                mdn: 'https://developer.mozilla.org/en-US/docs/Web/API/IdleDetector',
              },
            ],
            total: 13,
            safetyScore: 92,
          },
        },
        {
          file: 'src/styles/main.css',
          report: {
            safe: 15,
            risky: [
              {
                id: 'css-aspect-ratio',
                baseline: 'low',
                support: { chrome: '88', firefox: '89', safari: '15.0' },
                name: 'CSS aspect-ratio',
                mdn: 'https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio',
              },
            ],
            total: 16,
            safetyScore: 94,
          },
        },
      ],
    };

    setData(sampleData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Baseline compatibility report...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-warning-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load compatibility report</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Baseline Toolkit</h1>
                <p className="text-sm text-gray-500">Web Feature Compatibility Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-secondary">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
              <button className="btn-primary">
                <TrendingUp className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <OverviewCard
            title="Total Files"
            value={data.totalFiles}
            icon={FileText}
            trend={{ value: 12, isPositive: true }}
          />
          <OverviewCard
            title="Safety Score"
            value={`${data.safetyScore}%`}
            icon={CheckCircle}
            trend={{ value: 5, isPositive: true }}
            color="success"
          />
          <OverviewCard
            title="Safe Features"
            value={data.safeFeatures}
            icon={CheckCircle}
            subtitle={`of ${data.totalFeatures} total`}
            color="success"
          />
          <OverviewCard
            title="Risky Features"
            value={data.riskyFeatures}
            icon={AlertTriangle}
            trend={{ value: 3, isPositive: false }}
            color="warning"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Safety Chart */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Feature Safety Overview</h2>
                <FilterPanel filters={filters} onFiltersChange={setFilters} />
              </div>
              <SafetyChart data={data} filters={filters} />
            </div>

            {/* File Reports */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">File Analysis</h2>
              <FileReportsList reports={data.reports} filters={filters} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Risky Features */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Risky Features</h2>
              <RiskyFeaturesList reports={data.reports} filters={filters} />
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900">Generate Full Report</div>
                  <div className="text-sm text-gray-500">
                    Export detailed compatibility analysis
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900">Check New Files</div>
                  <div className="text-sm text-gray-500">Scan workspace for changes</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900">Upgrade Suggestions</div>
                  <div className="text-sm text-gray-500">
                    Get recommendations for risky features
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
