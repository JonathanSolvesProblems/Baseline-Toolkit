#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { glob } from 'glob';
import { readFileSync, writeFileSync, mkdirSync, existsSync  } from 'fs';
import { extname, relative, resolve, dirname } from 'path';
import { analyzeFile, loadConfig, type BaselineReport, type AnalysisContext } from '@baseline-toolkit/core';

const program = new Command();

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
  .action(async (paths: string[], options) => {
    const spinner = ora('Analyzing files for Baseline compatibility...').start();
    
    try {
      // Load configuration
      const config = loadConfig(options.config, process.cwd());
      
      const allFiles = new Set<string>();

      for (let p of paths) {
      const absPath = resolve(process.cwd(), p); // normalize
      const pattern = `${absPath}/**/*.{js,ts,jsx,tsx,css,scss}`;
      const files = await glob(pattern, { absolute: true });
      files.forEach(f => allFiles.add(f));
    }


      if (allFiles.size === 0) {
        console.log('No files found!');
        process.exit(1);
      }

      console.log('Files found:', Array.from(allFiles));


      spinner.text = `Analyzing ${allFiles.size} files...`;
      
      const reports: Array<{ file: string; report: BaselineReport }> = [];
      let totalSafe = 0;
      let totalRisky = 0;
      let totalFeatures = 0;

      // Analyze each file
      for (const filePath of allFiles) {
        try {
          const content = readFileSync(filePath, 'utf-8');
          const ext = extname(filePath);
          
          let type: 'css' | 'js' = 'js';
          if (ext === '.css' || ext === '.scss' || ext === '.sass') {
            type = 'css';
          }

          const context: AnalysisContext = {
            filePath,
            content,
            type,
            config,
          };

          const report = analyzeFile(context);
          reports.push({
            file: relative(process.cwd(), filePath),
            report,
          });

          totalSafe += report.safe;
          totalRisky += report.risky.length;
          totalFeatures += report.total;
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Failed to analyze ${filePath}`), error);
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
      } else {
        printReport(summary);
      }

      // Save to file if requested
      const outPath = options.output
        ? resolve(process.cwd(), options.output)
        : resolve(process.cwd(), 'core/baseline-report.json');

      const outDir = dirname(outPath);
      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
      }

      writeFileSync(outPath, JSON.stringify(summary, null, 2));
      console.log(chalk.green(`📁 Report saved to ${outPath}`));
      
      // Exit with appropriate code
      if (options.failOnRisky && totalRisky > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      spinner.fail('Analysis failed');
      console.error(chalk.red('Error:'), error);
      process.exit(1);
    }
  });

function printReport(summary: any): void {
  console.log(chalk.bold('\n📊 Baseline Compatibility Report\n'));
  
  console.log(chalk.blue('Summary:'));
  console.log(`  Files analyzed: ${summary.totalFiles}`);
  console.log(`  Total features: ${summary.totalFeatures}`);
  console.log(`  Safe features: ${chalk.green(summary.safeFeatures)} (${summary.safetyScore}%)`);
  console.log(`  Risky features: ${chalk.red(summary.riskyFeatures)}`);
  
  if (summary.riskyFeatures > 0) {
    console.log(chalk.yellow('\n⚠️  Risky Features Found:'));
    
    const riskyByFile = new Map<string, any[]>();
    summary.reports.forEach((r: any) => {
      if (r.report.risky.length > 0) {
        riskyByFile.set(r.file, r.report.risky);
      }
    });

    riskyByFile.forEach((risky, file) => {
      console.log(chalk.dim(`\n  ${file}:`));
      risky.forEach(feature => {
        const status = feature.baseline === false ? 'not baseline' : 'baseline low';
        const loc =
        feature.location && feature.location.line
          ? ` (line ${feature.location.line}, col ${feature.location.column ?? 1})`
          : '';

      console.log(`    - ${feature.id}${loc} (${chalk.red(status)})`);

      if (feature.value) {
        console.log(chalk.dim(`      ↳ ${feature.value}`));
      }
      if (feature.mdn) {
        console.log(chalk.dim(`      📖 ${feature.mdn}`));
      }
      });
    });
  } else {
    console.log(chalk.green('\n✅ All features are Baseline-safe!'));
  }
}

program.parse();