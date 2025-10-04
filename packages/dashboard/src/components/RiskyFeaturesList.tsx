import { ExternalLink, AlertTriangle, Clock } from 'lucide-react';
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
    // Only filter out features with baseline === false if showFalse is disabled
    if (feature.baseline === false && !filters.showFalse) return false;
    return true;
  });

  const groupedFeatures = filteredFeatures.reduce(
    (acc, feature) => {
      if (!acc[feature.id]) {
        acc[feature.id] = {
          ...feature,
          files: [feature.file],
        };
      } else {
        acc[feature.id].files.push(feature.file);
      }
      return acc;
    },
    {} as Record<string, any>
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
                <h4 className="font-medium text-gray-900">{feature.name || feature.id}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Found in {feature.files.length} file{feature.files.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {feature.baseline === false ? (
                  <span className="badge badge-error">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Not Baseline
                  </span>
                ) : (
                  <span className="badge badge-warning">
                    <Clock className="h-3 w-3 mr-1" />
                    Baseline Low
                  </span>
                )}
              </div>
            </div>

            {/* Browser Support */}
            {feature.support && Object.keys(feature.support).length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-1">Browser Support:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(feature.support).map(([browser, version]) => (
                    <span
                      key={browser}
                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                    >
                      {browser} {version as string | number}+
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Files:</p>
              <div className="space-y-1">
                {feature.files.map((file: string, index: number) => (
                  <div
                    key={index}
                    className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded"
                  >
                    {file}
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center space-x-4 text-sm">
              {feature.mdn && (
                <a
                  href={feature.mdn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  MDN Docs
                </a>
              )}
              {feature.spec && (
                <a
                  href={feature.spec}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Specification
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
