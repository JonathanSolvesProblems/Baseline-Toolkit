/**
 * Baseline status levels
 */
export type BaselineStatus = 'high' | 'low' | false;

/**
 * Browser support information
 */
export interface BrowserSupport {
  chrome?: string;
  firefox?: string;
  safari?: string;
  edge?: string;
}

/**
 * Risky feature information
 */
export interface RiskyFeature {
  /** Feature identifier */
  id: string;
  /** Baseline status */
  baseline: 'low' | false;
  /** Browser support versions */
  support: BrowserSupport;
  /** Feature name */
  name?: string;
  /** MDN documentation URL */
  mdn?: string;
  /** Specification URL */
  spec?: string;
  /** Baseline low date if applicable */
  baselineLowDate?: string;
  /** Expected baseline high date */
  baselineHighDate?: string;
}

/**
 * Analysis report for a file or code snippet
 */
export interface BaselineReport {
  /** Number of safe features found */
  safe: number;
  /** List of risky features */
  risky: RiskyFeature[];
  /** Total features analyzed */
  total: number;
  /** Percentage of safe features */
  safetyScore: number;
}

/**
 * Configuration for baseline analysis
 */
export interface BaselineConfig {
  /** Rules configuration */
  rules: {
    /** Allow features with 'low' baseline status */
    allowLow: boolean;
    /** Block features with 'false' baseline status */
    blockFalse: boolean;
  };
  /** Ignored feature IDs */
  ignore?: string[];
  /** Target browsers (future enhancement) */
  browsers?: string[];
}

/**
 * Feature detection result
 */
export interface FeatureDetection {
  /** Feature identifier */
  featureId: string;
  /** BCD key for the feature */
  bcdKey?: string;
  /** Source location */
  location: {
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
  };
  /** Raw value from code */
  value: string;
}

/**
 * Analysis context
 */
export interface AnalysisContext {
  /** File path being analyzed */
  filePath?: string;
  /** File content */
  content: string;
  /** File type */
  type: 'css' | 'js' | 'html';
  /** Configuration */
  config?: BaselineConfig;
}