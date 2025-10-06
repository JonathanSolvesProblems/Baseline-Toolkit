import type { BaselineConfig } from './types.js';
/**
 * Default baseline configuration
 */
export declare const DEFAULT_CONFIG: BaselineConfig;
/**
 * Loads baseline configuration from file
 */
export declare function loadConfig(configPath?: string, startDir?: string): BaselineConfig;
/**
 * Validates configuration object
 */
export declare function validateConfig(config: Partial<BaselineConfig>): BaselineConfig;
//# sourceMappingURL=config.d.ts.map