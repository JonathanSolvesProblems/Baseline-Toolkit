import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { describe, it, expect } from 'vitest';

// Path to the CLI binary
const binPath = path.resolve(__dirname, '../bin/baseline-check.js');

// Example test directory
const exampleDir = path.resolve(__dirname, 'test');

describe('CLI', () => {
  it('runs baseline-check on example directory', () => {
    if (!fs.existsSync(exampleDir)) {
      throw new Error(`Test directory not found: ${exampleDir}`);
    }

    const output = execSync(`node "${binPath}" "${exampleDir}"`, { encoding: 'utf-8' });

    expect(output).toContain('Baseline Compatibility Report');
    expect(output).toContain('Risky Features Found');
    expect(output).toMatch(/optional-chaining/);
    expect(output).toMatch(/broadcastchannel/);
    expect(output).toMatch(/line \d+, col \d+/);
    expect(output).toMatch(/↳/);
  });

  it('outputs JSON correctly with expected fields', () => {
    const output = execSync(`node "${binPath}" "${exampleDir}" --json`, { encoding: 'utf-8' });
    const json = JSON.parse(output);

    expect(json).toHaveProperty('totalFiles');
    expect(json).toHaveProperty('totalFeatures');
    expect(json).toHaveProperty('safeFeatures');
    expect(json).toHaveProperty('riskyFeatures');
    expect(json).toHaveProperty('reports');

    const report = json.reports[0];
    expect(report).toHaveProperty('filePath');
    expect(report).toHaveProperty('risky');
    expect(Array.isArray(report.risky)).toBe(true);

    if (report.risky.length > 0) {
      const first = report.risky[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('baseline');
      expect(first).toHaveProperty('support');
      expect(first).toHaveProperty('location');
      expect(first).toHaveProperty('value');
    }
  });
});
