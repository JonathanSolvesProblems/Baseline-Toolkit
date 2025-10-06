import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
/**
 * Default baseline configuration
 */
export const DEFAULT_CONFIG = {
    rules: {
        allowLow: false,
        blockFalse: true,
    },
    ignore: [],
};
/**
 * Loads baseline configuration from file
 */
export function loadConfig(configPath, startDir) {
    const searchPaths = [];
    if (configPath) {
        searchPaths.push(configPath);
    }
    else {
        // Search for config file starting from current directory
        let currentDir = startDir || process.cwd();
        while (currentDir !== dirname(currentDir)) {
            searchPaths.push(join(currentDir, 'baseline.config.json'), join(currentDir, '.baseline.json'), join(currentDir, 'package.json'));
            currentDir = dirname(currentDir);
        }
    }
    for (const searchPath of searchPaths) {
        if (existsSync(searchPath)) {
            try {
                const content = readFileSync(searchPath, 'utf-8');
                const parsed = JSON.parse(content);
                // Handle package.json baseline config
                if (searchPath.endsWith('package.json')) {
                    if (parsed.baseline) {
                        return { ...DEFAULT_CONFIG, ...parsed.baseline };
                    }
                    continue;
                }
                return { ...DEFAULT_CONFIG, ...parsed };
            }
            catch (error) {
                console.warn(`Failed to parse config file ${searchPath}:`, error);
            }
        }
    }
    return DEFAULT_CONFIG;
}
/**
 * Validates configuration object
 */
export function validateConfig(config) {
    const validated = {
        rules: {
            allowLow: config.rules?.allowLow ?? DEFAULT_CONFIG.rules.allowLow,
            blockFalse: config.rules?.blockFalse ?? DEFAULT_CONFIG.rules.blockFalse,
        },
        ignore: config.ignore ?? DEFAULT_CONFIG.ignore,
        browsers: config.browsers ?? DEFAULT_CONFIG.browsers,
    };
    return validated;
}
//# sourceMappingURL=config.js.map