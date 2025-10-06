/**
 * @baseline-toolkit/core - Core library for Baseline feature analysis
 *
 * This package provides the core functionality for analyzing web code
 * and determining the Baseline status of features used.
 */
export * from './types.js';
export * from './analyzer.js';
export * from './config.js';
// Re-export commonly used functions
export { analyzeFile, analyzeText, createReport } from './analyzer.js';
export { loadConfig, validateConfig, DEFAULT_CONFIG } from './config.js';
//# sourceMappingURL=index.js.map