// , RiskyFeature 
import type { BaselineReport} from '@baseline-toolkit/core';

export interface DashboardData {
  totalFiles: number;
  totalFeatures: number;
  safeFeatures: number;
  riskyFeatures: number;
  safetyScore: number;
  reports: FileReport[];
}

export interface FileReport {
  file: string;
  report: BaselineReport;
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