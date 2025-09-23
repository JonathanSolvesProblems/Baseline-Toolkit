import { parse as parseCss, walk } from 'css-tree';
import { parse as parseJs } from 'acorn';
import { simple as walkJs } from 'acorn-walk';
import { features } from 'web-features';
import { getStatus } from 'compute-baseline';
import type {
  BaselineReport,
  RiskyFeature,
  FeatureDetection,
  AnalysisContext,
  BaselineConfig,
  BaselineStatus,
  BrowserSupport,
} from './types.js';

/**
 * Default configuration for baseline analysis
 */
const DEFAULT_CONFIG: BaselineConfig = {
  rules: {
    allowLow: false,
    blockFalse: true,
  },
  ignore: [],
};

/**
 * Analyzes CSS code for Baseline feature usage
 */
export function analyzeCss(content: string): FeatureDetection[] {
  const detections: FeatureDetection[] = [];
  
  try {
    const ast = parseCss(content, {
      positions: true,
      filename: 'input.css',
    });

    walk(ast, function(node: any) {
      if (node.type === 'Property' && node.name) {
        const property = node.name;
        const value = node.value;
        
        // Map CSS properties to feature IDs
        const featureId = mapCssPropertyToFeature(property, value);
        if (featureId) {
          detections.push({
            featureId,
            bcdKey: `css.properties.${property}`,
            location: {
              line: node.loc?.start.line || 1,
              column: node.loc?.start.column || 1,
              endLine: node.loc?.end.line,
              endColumn: node.loc?.end.column,
            },
            value: `${property}: ${value}`,
          });
        }
      }
    });
  } catch (error) {
    console.warn('CSS parsing error:', error);
  }

  return detections;
}

/**
 * Analyzes JavaScript code for Baseline feature usage
 */
export function analyzeJs(content: string): FeatureDetection[] {
  const detections: FeatureDetection[] = [];

  try {
    const ast = parseJs(content, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
    });

    walkJs(ast, {
      MemberExpression(node) {
        if (node.object && node.property) {
          const apiCall = `${getNodeName(node.object)}.${getNodeName(node.property)}`;
          const featureId = mapJsApiToFeature(apiCall);
          
          if (featureId) {
            detections.push({
              featureId,
              bcdKey: `api.${apiCall}`,
              location: {
                line: node.loc?.start.line || 1,
                column: node.loc?.start.column || 1,
                endLine: node.loc?.end.line,
                endColumn: node.loc?.end.column,
              },
              value: apiCall,
            });
          }
        }
      },
      NewExpression(node) {
        if (node.callee.type === 'Identifier') {
          const apiName = node.callee.name;
          const featureId = mapJsApiToFeature(apiName);
          
          if (featureId) {
            detections.push({
              featureId,
              bcdKey: `api.${apiName}`,
              location: {
                line: node.loc?.start.line || 1,
                column: node.loc?.start.column || 1,
                endLine: node.loc?.end.line,
                endColumn: node.loc?.end.column,
              },
              value: `new ${apiName}()`,
            });
          }
        }
      },
    });
  } catch (error) {
    console.warn('JavaScript parsing error:', error);
  }

  return detections;
}

/**
 * Creates a baseline report from feature detections
 */
export function createReport(
  detections: FeatureDetection[],
  config: BaselineConfig = DEFAULT_CONFIG
): BaselineReport {
  const riskyFeatures: RiskyFeature[] = [];
  let safeCount = 0;

  for (const detection of detections) {
    // Skip ignored features
    if (config.ignore?.includes(detection.featureId)) {
      continue;
    }

    const feature = features[detection.featureId];
    let baselineStatus: BaselineStatus = false;

    // ✅ Prefer BCD key lookup first
    if (detection.bcdKey) {
      try {
        const status = getStatus(detection.featureId, detection.bcdKey);
        baselineStatus = status?.baseline || false;
      } catch {
        // ignore if not found, fallback below
      }
    }

    // 🔄 Fallback: feature-level baseline if no BCD info
    if (!baselineStatus && feature?.status?.baseline) {
      baselineStatus = feature.status.baseline;
    }

    // 🚨 Decide whether it's risky
    const isRisky =
      (baselineStatus === false && config.rules.blockFalse) ||
      (baselineStatus === 'low' && !config.rules.allowLow);

    if (isRisky) {
      const support: BrowserSupport = {};

      if (feature?.status?.support) {
        support.chrome = feature.status.support.chrome;
        support.firefox = feature.status.support.firefox;
        support.safari = feature.status.support.safari;
        support.edge = feature.status.support.edge;
      }

      const spec: string | undefined = Array.isArray(feature?.spec)
        ? feature.spec[0]
        : feature?.spec;

      riskyFeatures.push({
        id: detection.featureId,
        baseline: baselineStatus === false ? false : 'low',
        support,
        name: feature?.name,
        // mdn: Array.isArray(feature?.mdn_url) ? feature.mdn_url[0] : feature?.mdn_url,
        spec,
        baselineLowDate: feature?.status?.baseline_low_date,
        baselineHighDate: feature?.status?.baseline_high_date,
      });
    } else {
      safeCount++;
    }
  }

  const total = detections.length;
  const safetyScore = total > 0 ? Math.round((safeCount / total) * 100) : 100;

  return {
    safe: safeCount,
    risky: riskyFeatures,
    total,
    safetyScore,
  };
}


/**
 * Analyzes text content based on type
 */
export function analyzeText(content: string, type: 'css' | 'js'): BaselineReport {
  const detections = type === 'css' ? analyzeCss(content) : analyzeJs(content);
  return createReport(detections);
}

/**
 * Analyzes a file with context
 */
export function analyzeFile(context: AnalysisContext): BaselineReport {
  const config = { ...DEFAULT_CONFIG, ...context.config };
  const detections = context.type === 'css' 
    ? analyzeCss(context.content) 
    : analyzeJs(context.content);
  
  return createReport(detections, config);
}

// Helper functions

function getNodeName(node: any): string {
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'MemberExpression') {
    return `${getNodeName(node.object)}.${getNodeName(node.property)}`;
  }
  return 'unknown';
}

function mapCssPropertyToFeature(property: string, _value: any): string | null {
  // Map common CSS properties to feature IDs
  const cssFeatureMap: Record<string, string> = {
    'display': 'css-display',
    'grid': 'css-grid',
    'flexbox': 'css-flexbox',
    'color-scheme': 'css-color-scheme',
    'container-queries': 'css-container-queries',
    'word-break': 'css-word-break',
    'aspect-ratio': 'css-aspect-ratio',
    'gap': 'css-gap',
  };

  return cssFeatureMap[property] || null;
}

function mapJsApiToFeature(apiCall: string): string | null {
  // Map common JS APIs to feature IDs
  const jsFeatureMap: Record<string, string> = {
    'IdleDetector': 'idle-detection',
    'BroadcastChannel': 'broadcastchannel',
    'IntersectionObserver': 'intersectionobserver',
    'ResizeObserver': 'resizeobserver',
    'fetch': 'fetch',
    'Promise': 'promises',
    'async': 'async-functions',
    'URLPattern': 'urlpattern',
    'structuredClone': 'structured-clone',
  };

  return jsFeatureMap[apiCall] || null;
}