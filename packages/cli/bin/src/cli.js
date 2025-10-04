#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const glob_1 = require("glob");
const fs_1 = require("fs");
const path_1 = require("path");
const core_1 = require("@baseline-toolkit/core");
const program = new commander_1.Command();
program
    .name('baseline-check')
    .description('Check your code for Baseline feature compatibility')
    .version('1.0.0');
program
    .argument('[paths...]', 'Files or directories to analyze', ['src/'])
    .option('-c, --config <path>', 'Path to configuration file')
    .option('-o, --output <path>', 'Output report to JSON file')
    .option('--json', 'Output in JSON format')
    .option('--fail-on-risky', 'Exit with code 1 if risky features found', true)
    .option('--include <patterns>', 'File patterns to include (comma-separated)', '**/*.{js,ts,jsx,tsx,css,scss}')
    .option('--exclude <patterns>', 'File patterns to exclude (comma-separated)', '**/node_modules/**,**/dist/**')
    .action(async (paths, options) => {
    const spinner = (0, ora_1.default)('Analyzing files for Baseline compatibility...').start();
    try {
        // Load configuration
        const config = (0, core_1.loadConfig)(options.config, process.cwd());
        const allFiles = new Set();
        for (let p of paths) {
            const absPath = (0, path_1.resolve)(process.cwd(), p); // normalize
            const pattern = `${absPath}/**/*.{js,ts,jsx,tsx,css,scss}`;
            const files = await (0, glob_1.glob)(pattern, { absolute: true });
            files.forEach(f => allFiles.add(f));
        }
        if (allFiles.size === 0) {
            console.log('No files found!');
            process.exit(1);
        }
        console.log('Files found:', Array.from(allFiles));
        spinner.text = `Analyzing ${allFiles.size} files...`;
        const reports = [];
        let totalSafe = 0;
        let totalRisky = 0;
        let totalFeatures = 0;
        // Analyze each file
        for (const filePath of allFiles) {
            try {
                const content = (0, fs_1.readFileSync)(filePath, 'utf-8');
                const ext = (0, path_1.extname)(filePath);
                let type = 'js';
                if (ext === '.css' || ext === '.scss' || ext === '.sass') {
                    type = 'css';
                }
                const context = {
                    filePath,
                    content,
                    type,
                    config,
                };
                const report = (0, core_1.analyzeFile)(context);
                reports.push({
                    file: (0, path_1.relative)(process.cwd(), filePath),
                    report,
                });
                totalSafe += report.safe;
                totalRisky += report.risky.length;
                totalFeatures += report.total;
            }
            catch (error) {
                console.warn(chalk_1.default.yellow(`Warning: Failed to analyze ${filePath}`), error);
            }
        }
        spinner.stop();
        // Generate summary
        const overallSafetyScore = totalFeatures > 0
            ? Math.round((totalSafe / totalFeatures) * 100)
            : 100;
        const summary = {
            totalFiles: allFiles.size,
            totalFeatures,
            safeFeatures: totalSafe,
            riskyFeatures: totalRisky,
            safetyScore: overallSafetyScore,
            reports: reports.filter(r => r.report.total > 0),
        };
        // Output results
        if (options.json) {
            console.log(JSON.stringify(summary, null, 2));
        }
        else {
            printReport(summary);
        }
        // Save to file if requested
        if (options.output || options.json) {
            const outPath = options.output
                ? (0, path_1.resolve)(process.cwd(), options.output)
                : (0, path_1.resolve)(__dirname, '../../core/baseline-report.json');
            (0, fs_1.writeFileSync)(outPath, JSON.stringify(summary, null, 2));
            console.log(chalk_1.default.green(`📁 Report saved to ${outPath}`));
        }
        // Exit with appropriate code
        if (options.failOnRisky && totalRisky > 0) {
            process.exit(1);
        }
    }
    catch (error) {
        spinner.fail('Analysis failed');
        console.error(chalk_1.default.red('Error:'), error);
        process.exit(1);
    }
});
function printReport(summary) {
    console.log(chalk_1.default.bold('\n📊 Baseline Compatibility Report\n'));
    console.log(chalk_1.default.blue('Summary:'));
    console.log(`  Files analyzed: ${summary.totalFiles}`);
    console.log(`  Total features: ${summary.totalFeatures}`);
    console.log(`  Safe features: ${chalk_1.default.green(summary.safeFeatures)} (${summary.safetyScore}%)`);
    console.log(`  Risky features: ${chalk_1.default.red(summary.riskyFeatures)}`);
    if (summary.riskyFeatures > 0) {
        console.log(chalk_1.default.yellow('\n⚠️  Risky Features Found:'));
        const riskyByFile = new Map();
        summary.reports.forEach((r) => {
            if (r.report.risky.length > 0) {
                riskyByFile.set(r.file, r.report.risky);
            }
        });
        riskyByFile.forEach((risky, file) => {
            console.log(chalk_1.default.dim(`\n  ${file}:`));
            risky.forEach(feature => {
                const status = feature.baseline === false ? 'not baseline' : 'baseline low';
                const loc = feature.location && feature.location.line
                    ? ` (line ${feature.location.line}, col ${feature.location.column ?? 1})`
                    : '';
                console.log(`    - ${feature.id}${loc} (${chalk_1.default.red(status)})`);
                if (feature.value) {
                    console.log(chalk_1.default.dim(`      ↳ ${feature.value}`));
                }
                if (feature.mdn) {
                    console.log(chalk_1.default.dim(`      📖 ${feature.mdn}`));
                }
            });
        });
    }
    else {
        console.log(chalk_1.default.green('\n✅ All features are Baseline-safe!'));
    }
}
program.parse();
//# sourceMappingURL=cli.js.map