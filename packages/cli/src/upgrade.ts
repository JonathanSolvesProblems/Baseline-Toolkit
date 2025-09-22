#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { join, relative } from 'path';

const program = new Command();

program
  .name('baseline-upgrade')
  .description('Suggest upgrades for legacy web features')
  .version('1.0.0');

interface UpgradeSuggestion {
  file: string;
  line: number;
  column: number;
  from: string;
  to: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

const UPGRADE_PATTERNS = [
  {
    pattern: /float\s*:\s*(left|right)/gi,
    suggestion: 'Consider using CSS Grid or Flexbox instead of float',
    replacement: 'display: flex; /* or display: grid; */',
    confidence: 'high' as const,
  },
  {
    pattern: /XMLHttpRequest/gi,
    suggestion: 'Use fetch() API instead of XMLHttpRequest',
    replacement: 'fetch()',
    confidence: 'high' as const,
  },
  {
    pattern: /document\.getElementById/gi,
    suggestion: 'Consider using document.querySelector() for consistency',
    replacement: 'document.querySelector()',
    confidence: 'medium' as const,
  },
  {
    pattern: /\.indexOf\(\s*.+\s*\)\s*[>!=]==?\s*-1/gi,
    suggestion: 'Use .includes() instead of .indexOf()',
    replacement: '.includes()',
    confidence: 'high' as const,
  },
];

program
  .argument('[paths...]', 'Files or directories to analyze for upgrades', ['src/'])
  .option('--apply', 'Apply automatic upgrades where safe')
  .option('--confidence <level>', 'Minimum confidence level (high|medium|low)', 'medium')
  .action(async (paths: string[], options) => {
    console.log(chalk.bold('🔄 Baseline Upgrade Advisor\n'));

    const allFiles = new Set<string>();
    
    // Find files to analyze
    for (const path of paths) {
      const files = await glob(join(path, '**/*.{js,ts,jsx,tsx,css,scss}'), {
        ignore: ['**/node_modules/**', '**/dist/**'],
        absolute: true,
      });
      files.forEach(file => allFiles.add(file));
    }

    if (allFiles.size === 0) {
      console.log(chalk.red('No files found to analyze'));
      process.exit(1);
    }

    console.log(`Analyzing ${allFiles.size} files for upgrade opportunities...\n`);
    
    const suggestions: UpgradeSuggestion[] = [];
    const confidenceOrder = ['high', 'medium', 'low'];
    const minConfidenceIndex = confidenceOrder.indexOf(options.confidence);

    for (const filePath of allFiles) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const relativePath = relative(process.cwd(), filePath);

        lines.forEach((line, lineIndex) => {
          UPGRADE_PATTERNS.forEach(pattern => {
            const confidenceIndex = confidenceOrder.indexOf(pattern.confidence);
            if (confidenceIndex < minConfidenceIndex) return;

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
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Could not read ${filePath}`));
      }
    }

    if (suggestions.length === 0) {
      console.log(chalk.green('✅ No upgrade suggestions found. Your code looks modern!'));
      return;
    }

    // Group suggestions by confidence
    const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
      if (!acc[suggestion.confidence]) {
        acc[suggestion.confidence] = [];
      }
      acc[suggestion.confidence].push(suggestion);
      return acc;
    }, {} as Record<string, UpgradeSuggestion[]>);

    // Display suggestions
    ['high', 'medium', 'low'].forEach(confidence => {
      const items = groupedSuggestions[confidence];
      if (!items?.length) return;

      const icon = confidence === 'high' ? '🔥' : confidence === 'medium' ? '💡' : '💭';
      const color = confidence === 'high' ? chalk.red : confidence === 'medium' ? chalk.yellow : chalk.gray;
      
      console.log(color(`${icon} ${confidence.toUpperCase()} CONFIDENCE (${items.length} suggestions):`));
      
      items.forEach(suggestion => {
        console.log(`  ${chalk.dim(suggestion.file)}:${suggestion.line}:${suggestion.column}`);
        console.log(`    ${chalk.dim('Found:')} ${suggestion.from}`);
        console.log(`    ${chalk.dim('Suggestion:')} ${suggestion.reason}`);
        console.log(`    ${chalk.dim('Consider:')} ${suggestion.to}`);
        console.log();
      });
    });

    console.log(chalk.blue(`\n📈 Summary: Found ${suggestions.length} upgrade opportunities`));
    console.log(chalk.dim('Note: These are suggestions. Please review before applying changes.\n'));

    if (options.apply) {
      console.log(chalk.yellow('⚠️  Automatic application of upgrades is not yet implemented.'));
      console.log(chalk.dim('This feature will be added in a future version for high-confidence suggestions.'));
    }
  });

program.parse();