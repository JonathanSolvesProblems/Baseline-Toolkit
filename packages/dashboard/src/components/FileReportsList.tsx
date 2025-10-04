import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import type { FileReport, FilterOptions } from '../types';

interface FileReportsListProps {
  reports: FileReport[];
  filters: FilterOptions;
}

export function FileReportsList({ reports, filters }: FileReportsListProps) {
  const filteredReports = reports.filter((report) => {
    // If there are no risky features and "showSafe" is false, skip this report
    if (report.report.risky.length === 0 && !filters.showSafe) return false;

    // Check if there are any risky features (baseline === false)
    const hasFalse = report.report.risky.some((f) => f.baseline === false);

    // If there are risky features but "showFalse" is false, skip this report
    if (hasFalse && !filters.showFalse) return false;

    return true;
  });

  return (
    <div className="space-y-4">
      {filteredReports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No files match current filters</p>
        </div>
      ) : (
        filteredReports.map((report, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <h4 className="font-medium text-gray-900">{report.file}</h4>
                  <p className="text-sm text-gray-500">{report.report.total} features analyzed</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    report.report.safetyScore >= 90
                      ? 'bg-success-100 text-success-800'
                      : report.report.safetyScore >= 70
                        ? 'bg-warning-100 text-warning-800'
                        : 'bg-error-100 text-error-800'
                  }`}
                >
                  {report.report.safetyScore}% safe
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Safety Score</span>
                <span>
                  {report.report.safe}/{report.report.total} features safe
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    report.report.safetyScore >= 90
                      ? 'bg-success-500'
                      : report.report.safetyScore >= 70
                        ? 'bg-warning-500'
                        : 'bg-error-500'
                  }`}
                  style={{ width: `${report.report.safetyScore}%` }}
                />
              </div>
            </div>

            {/* Risky Features Summary */}
            {report.report.risky.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-warning-500" />
                  Risky Features ({report.report.risky.length})
                </h5>
                <div className="space-y-1">
                  {report.report.risky.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{feature.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          feature.baseline === false
                            ? 'bg-error-100 text-error-700'
                            : 'bg-warning-100 text-warning-700'
                        }`}
                      >
                        {feature.baseline === false ? 'Not Baseline' : 'Baseline Safe'}
                      </span>
                    </div>
                  ))}
                  {report.report.risky.length > 3 && (
                    <p className="text-sm text-gray-500">
                      +{report.report.risky.length - 3} more features
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Safe Features Summary */}
            {report.report.safe > 0 && filters.showSafe && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1 text-success-500" />
                  {report.report.safe} features are Baseline-safe
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
