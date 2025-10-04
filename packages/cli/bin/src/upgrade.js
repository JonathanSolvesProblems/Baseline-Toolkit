#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const glob_1 = require("glob");
const fs_1 = require("fs");
const path_1 = require("path");
const program = new commander_1.Command();
program
    .name('baseline-upgrade')
    .description('Suggest upgrades for legacy web features')
    .version('1.0.0');
const UPGRADE_PATTERNS = [
    {
        pattern: /float\s*:\s*(left|right)/gi,
        suggestion: 'Consider using CSS Grid or Flexbox instead of float',
        replacement: 'display: flex; /* or display: grid; */',
        confidence: 'high',
    },
    {
        pattern: /XMLHttpRequest/gi,
        suggestion: 'Use fetch() API instead of XMLHttpRequest',
        replacement: 'fetch()',
        confidence: 'high',
    },
    {
        pattern: /document\.getElementById/gi,
        suggestion: 'Consider using document.querySelector() for consistency',
        replacement: 'document.querySelector()',
        confidence: 'medium',
    },
    {
        pattern: /\.indexOf\(\s*.+\s*\)\s*[>!=]==?\s*-1/gi,
        suggestion: 'Use .includes() instead of .indexOf()',
        replacement: '.includes()',
        confidence: 'high',
    },
];
program
    .argument('[paths...]', 'Files or directories to analyze for upgrades', ['src/'])
    .option('--apply', 'Apply automatic upgrades where safe')
    .option('--confidence <level>', 'Minimum confidence level (high|medium|low)', 'medium')
    .action(async (paths, options) => {
    console.log(chalk_1.default.bold('🔄 Baseline Upgrade Advisor\n'));
    const allFiles = new Set();
    // Find files to analyze
    for (const path of paths) {
        const files = await (0, glob_1.glob)((0, path_1.join)(path, '**/*.{js,ts,jsx,tsx,css,scss}'), {
            ignore: ['**/node_modules/**', '**/dist/**'],
            absolute: true,
        });
        files.forEach(file => allFiles.add(file));
    }
    if (allFiles.size === 0) {
        console.log(chalk_1.default.red('No files found to analyze'));
        process.exit(1);
    }
    console.log(`Analyzing ${allFiles.size} files for upgrade opportunities...\n`);
    const suggestions = [];
    const confidenceOrder = ['high', 'medium', 'low'];
    const minConfidenceIndex = confidenceOrder.indexOf(options.confidence);
    for (const filePath of allFiles) {
        try {
            const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
            const lines = content.split('\n');
            const relativePath = (0, path_1.relative)(process.cwd(), filePath);
            lines.forEach((line, lineIndex) => {
                UPGRADE_PATTERNS.forEach(pattern => {
                    const confidenceIndex = confidenceOrder.indexOf(pattern.confidence);
                    if (confidenceIndex < minConfidenceIndex)
                        return;
                    const matches = [...line.matchAll(pattern.pattern)];
                    matches.forEach(match => {
                        if (match.index !== undefined) {
                            suggestions.push({
                                file: relativePath,
                                line: lineIndex + 1,
                                column: match.index + 1,
                                from: match[0],
                                to: pattern.replacement,
                                reason: pattern.suggestion,
                                confidence: pattern.confidence,
                            });
                        }
                    });
                });
            });
        }
        catch (error) {
            console.warn(chalk_1.default.yellow(`Warning: Could not read ${filePath}`));
        }
    }
    if (suggestions.length === 0) {
        console.log(chalk_1.default.green('✅ No upgrade suggestions found. Your code looks modern!'));
        return;
    }
    // Group suggestions by confidence
    const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
        if (!acc[suggestion.confidence]) {
            acc[suggestion.confidence] = [];
        }
        acc[suggestion.confidence].push(suggestion);
        return acc;
    }, {});
    // Display suggestions
    ['high', 'medium', 'low'].forEach(confidence => {
        const items = groupedSuggestions[confidence];
        if (!items?.length)
            return;
        const icon = confidence === 'high' ? '🔥' : confidence === 'medium' ? '💡' : '💭';
        const color = confidence === 'high' ? chalk_1.default.red : confidence === 'medium' ? chalk_1.default.yellow : chalk_1.default.gray;
        console.log(color(`${icon} ${confidence.toUpperCase()} CONFIDENCE (${items.length} suggestions):`));
        items.forEach(suggestion => {
            console.log(`  ${chalk_1.default.dim(suggestion.file)}:${suggestion.line}:${suggestion.column}`);
            console.log(`    ${chalk_1.default.dim('Found:')} ${suggestion.from}`);
            console.log(`    ${chalk_1.default.dim('Suggestion:')} ${suggestion.reason}`);
            console.log(`    ${chalk_1.default.dim('Consider:')} ${suggestion.to}`);
            console.log();
        });
    });
    console.log(chalk_1.default.blue(`\n📈 Summary: Found ${suggestions.length} upgrade opportunities`));
    console.log(chalk_1.default.dim('Note: These are suggestions. Please review before applying changes.\n'));
    if (options.apply) {
        console.log(chalk_1.default.yellow('⚠️  Automatic application of upgrades is not yet implemented.'));
        console.log(chalk_1.default.dim('This feature will be added in a future version for high-confidence suggestions.'));
    }
});
program.parse();
//# sourceMappingURL=upgrade.js.map