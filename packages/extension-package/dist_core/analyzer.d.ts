import type { BaselineReport, FeatureDetection, AnalysisContext, BaselineConfig } from './types.js';
export declare function analyzeCss(content: string): FeatureDetection[];
export declare function analyzeJs(content: string): FeatureDetection[];
export declare function analyzeHtml(content: string): FeatureDetection[];
export declare function createReport(detections: FeatureDetection[], config?: BaselineConfig): BaselineReport;
export declare function analyzeText(content: string, type: 'css' | 'js' | 'html'): BaselineReport;
export declare function analyzeFile(context: AnalysisContext): BaselineReport;
//# sourceMappingURL=analyzer.d.ts.map