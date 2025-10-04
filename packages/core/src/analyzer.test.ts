import { analyzeText, analyzeCss, analyzeJs, createReport } from './analyzer';
import type { FeatureDetection } from './types';

describe('CSS Analysis', () => {
  it('should detect CSS grid usage', () => {
    const css = `
      .container {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
    `;
    
    const detections = analyzeCss(css);
    expect(detections).toHaveLength(2);
    expect(detections[0].featureId).toBe('css-display');
    expect(detections[1].featureId).toBe('css-grid-template-columns');
  });

  it('should handle invalid CSS gracefully', () => {
    const css = 'invalid css {';
    const detections = analyzeCss(css);
    expect(detections).toEqual([]);
  });
});

describe('JavaScript Analysis', () => {
  it('should detect modern APIs', () => {
    const js = `
      const channel = new BroadcastChannel('test');
      fetch('/api/data').then(response => response.json());
    `;
    
    const detections = analyzeJs(js);
    expect(detections.length).toBeGreaterThan(0);
    expect(detections.some(d => d.featureId === 'broadcastchannel')).toBe(true);
  });

  it('should handle invalid JavaScript gracefully', () => {
    const js = 'const invalid = {';
    const detections = analyzeJs(js);
    expect(detections).toEqual([]);
  });
});

describe('Report Creation', () => {
  it('should create accurate baseline reports', () => {
    const mockDetections: FeatureDetection[] = [
      {
        featureId: 'css-grid',
        location: { line: 1, column: 1 },
        value: 'display: grid'
      },
      {
        featureId: 'idle-detection',
        location: { line: 2, column: 1 },
        value: 'new IdleDetector()'
      }
    ];

    const report = createReport(mockDetections);
    expect(report.total).toBe(2);
    expect(report.safetyScore).toBeGreaterThanOrEqual(0);
    expect(report.safetyScore).toBeLessThanOrEqual(100);
  });

  it('should handle empty detections', () => {
    const report = createReport([]);
    expect(report.total).toBe(0);
    expect(report.safe).toBe(0);
    expect(report.risky).toEqual([]);
    expect(report.safetyScore).toBe(100);
  });
});

describe('Text Analysis', () => {
  it('should analyze CSS text', () => {
    const css = '.test { display: flex; }';
    const report = analyzeText(css, 'css');
    expect(report.total).toBeGreaterThanOrEqual(0);
  });

  it('should analyze JavaScript text', () => {
    const js = 'const observer = new IntersectionObserver(() => {});';
    const report = analyzeText(js, 'js');
    expect(report.total).toBeGreaterThanOrEqual(0);
  });
});