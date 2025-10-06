import { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle /* TrendingUp, Settings */,
} from 'lucide-react';
import { OverviewCard } from './components/OverviewCard';
import { SafetyChart } from './components/SafetyChart';
import { RiskyFeaturesList } from './components/RiskyFeaturesList';
import { FileReportsList } from './components/FileReportsList';
import { FilterPanel } from './components/FilterPanel';
import type { DashboardData, FilterOptions } from './types';
import { AIButton } from './components/AIButton';

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    showSafe: true,
    showLow: true,
    showFalse: true,
  });

  // Dynamically load report from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reportParam = params.get('report');

    if (reportParam) {
      try {
        // Decode base64 JSON from query param
        const json = JSON.parse(atob(decodeURIComponent(reportParam)));
        setData(json);
      } catch (err) {
        console.error('Failed to parse report JSON:', err);
      }
    }
  }, []);

  // Friendly message if no report is loaded
  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">No Baseline Report Loaded</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Please use the VS Code Baseline Toolkit extension to generate a report for your workspace.
          Once generated, your personalized report will appear here.
        </p>
        <a
          href="https://marketplace.visualstudio.com/items?itemName=your-extension-id"
          target="_blank"
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
        >
          Install Extension
        </a>
      </div>
    );
  }

  // Render the normal dashboard if data is available
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
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Feature Safety Overview</h2>
                <FilterPanel filters={filters} onFiltersChange={setFilters} />
              </div>
              <SafetyChart data={data} filters={filters} />
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">File Analysis</h2>
              <FileReportsList reports={data.reports} filters={filters} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Risky Features</h2>
              <RiskyFeaturesList reports={data.reports} filters={filters} />
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <AIButton
                    title="Generate Full Report"
                    getPrompt={() =>
                      `Analyze this baseline report and suggest improvements: ${JSON.stringify(data)}`
                    }
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Export detailed compatibility analysis
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <AIButton
                    title="Check New Files"
                    getPrompt={() =>
                      `Scan these new files for risky features and suggest improvements: ${JSON.stringify(data)}`
                    }
                  />
                  <div className="text-sm text-gray-500 mt-1">Scan workspace for changes</div>
                </div>

                <div className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <AIButton
                    title="Upgrade Suggestions"
                    getPrompt={() =>
                      `Given this baseline report, provide upgrade suggestions for risky features: ${JSON.stringify(data)}`
                    }
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    Get recommendations for risky features
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
