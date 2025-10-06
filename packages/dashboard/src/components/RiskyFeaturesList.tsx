import { AlertTriangle } from 'lucide-react';
import type { FileReport, FilterOptions } from '../types';

interface RiskyFeaturesListProps {
  reports: FileReport[];
  filters: FilterOptions;
}

export function RiskyFeaturesList({ reports, filters }: RiskyFeaturesListProps) {
  const allRiskyFeatures = reports.flatMap((report) =>
    report.report.risky.map((feature) => ({
      ...feature,
      file: report.file,
    }))
  );

  const filteredFeatures = allRiskyFeatures.filter((feature) => {
    // Filter out safe features if showSafe is false
    if (!filters.showSafe && !feature.location) return false;
    return true;
  });

  const groupedFeatures = filteredFeatures.reduce(
    (acc, feature) => {
      if (!acc[feature.id]) {
        acc[feature.id] = {
          ...feature,
          files: [{ file: feature.file, location: feature.location, value: feature.value }],
        };
      } else {
        acc[feature.id].files.push({
          file: feature.file,
          location: feature.location,
          value: feature.value,
        });
      }
      return acc;
    },
    {} as Record<
      string,
      {
        id: string;
        files: { file: string; location?: { line: number; column: number }; value?: string }[];
      }
    >
  );

  return (
    <div className="space-y-4">
      {Object.entries(groupedFeatures).length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No risky features found with current filters</p>
        </div>
      ) : (
        Object.entries(groupedFeatures).map(([id, feature]) => (
          <div key={id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{feature.id}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Found in {feature.files.length} file{feature.files.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <span className="badge badge-error flex items-center px-2 py-0.5 text-xs rounded">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Issue
                </span>
              </div>
            </div>

            {/* Files and locations */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Files & Locations:</p>
              <div className="space-y-1">
                {feature.files.map((f, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded"
                  >
                    {f.file}
                    {f.location ? ` (line ${f.location.line}, col ${f.location.column})` : ''}
                    {f.value ? ` → ${f.value}` : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
