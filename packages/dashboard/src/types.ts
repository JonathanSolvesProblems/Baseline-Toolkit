// types.ts

// Local type that matches the JSON structure exactly
export interface RiskyFeature {
  id: string;
  baseline: boolean;
  support: Record<string, any>;
  location: { line: number; column: number };
  value?: string;
  mdn?: string;
}

export interface LocalBaselineReport {
  safe: number;
  risky: RiskyFeature[];
  total: number;
  safetyScore: number;
}

export interface FileReport {
  file: string;
  report: LocalBaselineReport;
}

export interface DashboardData {
  totalFiles: number;
  totalFeatures: number;
  safeFeatures: number;
  riskyFeatures: number;
  safetyScore: number;
  reports: FileReport[];
}

export interface FilterOptions {
  showSafe: boolean;
  showLow: boolean;
  showFalse: boolean;
}

export interface TrendData {
  value: number;
  isPositive: boolean;
}
