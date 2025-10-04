import { analyzeFile, type AnalysisContext } from './analyzer';
import type { FeatureDetection } from './types';

describe('CSS Analysis', () => {
  it('should detect CSS grid usage', () => {
    const css = `
      .container {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    `;

    const context: AnalysisContext = { filePath: 'test.css', content: css, type: 'css', config: {} };
    const report = analyzeFile(context);

    expect(report.total).toBeGreaterThan(0);
    expect(report.risky.some(r => r.id === 'css-display')).toBe(true);
    expect(report.risky.some(r => r.id === 'css-grid-template-columns')).toBe(true);
  });

  it('should handle invalid CSS gracefully', () => {
    const css = 'invalid css {';
    const context: AnalysisContext = { filePath: 'test.css', content: css, type: 'css', config: {} };
    const report = analyzeFile(context);

    expect(report.total).toBe(0);
    expect(report.risky).toEqual([]);
  });
});

describe('JavaScript Analysis', () => {
  it('should detect modern APIs and risky features with locations', () => {
    const js = `
      const channel = new BroadcastChannel('test');
      fetch('/api/data').then(response => response.json());
      const user = { name: "Jon" };
      console.log(user?.age);
    `;

    const context: AnalysisContext = { filePath: 'test.js', content: js, type: 'js', config: {} };
    const report = analyzeFile(context);

    expect(report.total).toBeGreaterThan(0);
    expect(report.risky.some(r => r.id === 'broadcastchannel')).toBe(true);
    expect(report.risky.some(r => r.id === 'optional-chaining')).toBe(true);

    // Check that locations and values are provided
    const risky = report.risky.find(r => r.id === 'optional-chaining');
    expect(risky?.location).toBeDefined();
    expect(risky?.value).toContain('?.');
  });

  it('should handle invalid JavaScript gracefully', () => {
    const js = 'const invalid = {';
    const context: AnalysisContext = { filePath: 'test.js', content: js, type: 'js', config: {} };
    const report = analyzeFile(context);

    expect(report.total).toBe(0);
    expect(report.risky).toEqual([]);
  });
});

describe('Report Creation', () => {
  it('should handle empty detections correctly', () => {
    const context: AnalysisContext = { filePath: 'empty.js', content: '', type: 'js', config: {} };
    const report = analyzeFile(context);

    expect(report.total).toBe(0);
    expect(report.safe).toBe(0);
    expect(report.risky).toEqual([]);
    expect(report.safetyScore).toBe(100);
  });
});
