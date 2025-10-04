import { execSync } from 'child_process';
import path from 'path';

const binPath = path.resolve(__dirname, '../bin/baseline-check.js');
const exampleDir = path.resolve(__dirname, '../test/example.js');

describe('CLI', () => {
  it('runs baseline-check on example file', () => {
    const output = execSync(`node "${binPath}" "${exampleDir}"`, { encoding: 'utf-8' });
    expect(output).toContain('Baseline Compatibility Report');
  });

  it('outputs JSON correctly', () => {
    const output = execSync(`node "${binPath}" "${exampleDir}" --json`, { encoding: 'utf-8' });
    const json = JSON.parse(output);
    expect(json).toHaveProperty('totalFiles');
    expect(json).toHaveProperty('reports');
  });
});
