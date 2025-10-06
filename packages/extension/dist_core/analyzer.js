import { parse as parseCss, walk, generate } from 'css-tree';
import { parse as parseJs } from 'acorn';
import { simple as walkJs } from 'acorn-walk';
import { parse as parseHtml } from 'node-html-parser';
import { features } from 'web-features';
import { getStatus } from 'compute-baseline';
/**
 * Default configuration for baseline analysis
 */
const DEFAULT_CONFIG = {
    rules: {
        allowLow: false,
        blockFalse: true,
    },
    ignore: [],
};
/* -------------------------------------------------------------------------- */
/*                               CSS ANALYSIS                                 */
/* -------------------------------------------------------------------------- */
export function analyzeCss(content) {
    const detections = [];
    try {
        const ast = parseCss(content, { positions: true, filename: 'input.css' });
        walk(ast, function (node) {
            if (node.type === 'Declaration' && node.property) {
                const property = node.property;
                const value = generate(node.value);
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
    }
    catch (error) {
        console.warn('CSS parsing error:', error);
    }
    return detections;
}
/* -------------------------------------------------------------------------- */
/*                               JS ANALYSIS                                  */
/* -------------------------------------------------------------------------- */
export function analyzeJs(content) {
    const detections = [];
    try {
        const ast = parseJs(content, {
            ecmaVersion: 'latest',
            sourceType: 'module',
            locations: true,
        });
        walkJs(ast, {
            // Detect property or API usage
            MemberExpression(node) {
                const apiCall = `${getNodeName(node.object)}.${getNodeName(node.property)}`;
                const featureId = mapJsApiToFeature(apiCall);
                if (featureId) {
                    detections.push({
                        featureId,
                        bcdKey: `api.${getNodeName(node.property).toLowerCase()}`,
                        location: node.loc,
                        value: apiCall,
                    });
                }
                // Optional chaining: obj?.prop
                if (node.optional) {
                    detections.push({
                        featureId: 'optional-chaining',
                        bcdKey: 'js.optional-chaining',
                        location: node.loc,
                        value: '?.',
                    });
                }
            },
            // Detect new expressions like new BroadcastChannel()
            NewExpression(node) {
                const ctorName = getNodeName(node.callee);
                const featureId = mapJsApiToFeature(ctorName);
                if (featureId) {
                    detections.push({
                        featureId,
                        bcdKey: `api.${ctorName.toLowerCase()}`,
                        location: node.loc,
                        value: `new ${ctorName}()`,
                    });
                }
            },
            // BigInt literals: 123n
            Literal(node) {
                if (typeof node.value === 'bigint' || /\d+n/.test(node.raw)) {
                    detections.push({
                        featureId: 'bigint',
                        bcdKey: 'js.bigint',
                        location: node.loc,
                        value: node.raw,
                    });
                }
            },
            // Nullish coalescing operator: ??
            LogicalExpression(node) {
                if (node.operator === '??') {
                    detections.push({
                        featureId: 'nullish-coalescing',
                        bcdKey: 'js.nullish-coalescing',
                        location: node.loc,
                        value: '??',
                    });
                }
            },
            // Async functions
            FunctionDeclaration(node) {
                if (node.async) {
                    detections.push({
                        featureId: 'async-functions',
                        bcdKey: 'js.async-functions',
                        location: node.loc,
                        value: 'async function',
                    });
                }
            },
        });
    }
    catch (error) {
        console.warn('JavaScript parsing error:', error);
    }
    return detections;
}
/* -------------------------------------------------------------------------- */
/*                               HTML ANALYSIS                                */
/* -------------------------------------------------------------------------- */
export function analyzeHtml(content) {
    const detections = [];
    try {
        const root = parseHtml(content);
        // Inline <script>
        root.querySelectorAll('script').forEach((script) => {
            const js = script.textContent || '';
            detections.push(...analyzeJs(js));
        });
        // Inline <style>
        root.querySelectorAll('style').forEach((style) => {
            const css = style.textContent || '';
            detections.push(...analyzeCss(css));
        });
    }
    catch (err) {
        console.warn('HTML parsing error:', err);
    }
    return detections;
}
/* -------------------------------------------------------------------------- */
/*                             REPORT CREATION                                */
/* -------------------------------------------------------------------------- */
export function createReport(detections, config = DEFAULT_CONFIG) {
    const riskyFeatures = [];
    let safeCount = 0;
    for (const detection of detections) {
        if (config.ignore?.includes(detection.featureId))
            continue;
        const feature = features[detection.featureId];
        let baselineStatus = false;
        if (detection.bcdKey) {
            try {
                const status = getStatus(detection.featureId, detection.bcdKey);
                baselineStatus = status?.baseline || false;
            }
            catch {
                /* ignore */
            }
        }
        if (!baselineStatus && feature?.status?.baseline) {
            baselineStatus = feature.status.baseline;
        }
        const isRisky = (baselineStatus === false && config.rules.blockFalse) ||
            (baselineStatus === 'low' && !config.rules.allowLow);
        if (isRisky) {
            const support = {};
            if (feature?.status?.support) {
                support.chrome = feature.status.support.chrome;
                support.firefox = feature.status.support.firefox;
                support.safari = feature.status.support.safari;
                support.edge = feature.status.support.edge;
            }
            riskyFeatures.push({
                id: detection.featureId,
                baseline: baselineStatus === false ? false : 'low',
                support,
                name: feature?.name,
                spec: Array.isArray(feature?.spec) ? feature.spec[0] : feature?.spec,
                baselineLowDate: feature?.status?.baseline_low_date,
                baselineHighDate: feature?.status?.baseline_high_date,
                location: detection.location
                    ? {
                        line: detection.location.line || detection.location.start?.line || 1,
                        column: detection.location.column || detection.location.start?.column || 1,
                    }
                    : undefined,
                value: detection.value,
            });
        }
        else {
            safeCount++;
        }
    }
    const total = detections.length;
    const safetyScore = total > 0 ? Math.round((safeCount / total) * 100) : 100;
    return { safe: safeCount, risky: riskyFeatures, total, safetyScore };
}
/* -------------------------------------------------------------------------- */
/*                         TEXT + FILE ENTRY POINTS                           */
/* -------------------------------------------------------------------------- */
export function analyzeText(content, type) {
    const detections = type === 'css'
        ? analyzeCss(content)
        : type === 'html'
            ? analyzeHtml(content)
            : analyzeJs(content);
    return createReport(detections);
}
export function analyzeFile(context) {
    const config = { ...DEFAULT_CONFIG, ...context.config };
    const detections = context.type === 'css'
        ? analyzeCss(context.content)
        : context.type === 'html'
            ? analyzeHtml(context.content)
            : analyzeJs(context.content);
    return createReport(detections, config);
}
/* -------------------------------------------------------------------------- */
/*                                HELPERS                                     */
/* -------------------------------------------------------------------------- */
function getNodeName(node) {
    if (!node)
        return 'unknown';
    if (node.type === 'Identifier')
        return node.name;
    if (node.type === 'MemberExpression')
        return `${getNodeName(node.object)}.${getNodeName(node.property)}`;
    return 'unknown';
}
function mapCssPropertyToFeature(property, value) {
    switch (property) {
        case 'display':
            if (value.includes('grid'))
                return 'css-display';
            if (value.includes('subgrid'))
                return 'css-subgrid';
            break;
        case 'grid-template-columns':
        case 'grid-template-rows':
            if (value.includes('subgrid'))
                return 'css-subgrid';
            return 'css-grid-template-columns';
        case 'container-type':
        case 'container-name':
            return 'css-container-queries';
        case 'word-break':
            if (value.includes('auto-phrase'))
                return 'css-word-break-auto-phrase';
            return 'css-word-break';
        case 'color-scheme':
            return 'css-color-scheme';
    }
    return null;
}
function mapJsApiToFeature(apiCall) {
    const jsFeatureMap = {
        IdleDetector: 'idle-detection',
        BroadcastChannel: 'broadcastchannel',
        IntersectionObserver: 'intersectionobserver',
        ResizeObserver: 'resizeobserver',
        fetch: 'fetch',
        Promise: 'promises',
        async: 'async-functions',
        URLPattern: 'urlpattern',
        structuredClone: 'structured-clone',
        WeakRef: 'weakref',
        FinalizationRegistry: 'finalizationregistry',
        Atomics: 'shared-memory',
    };
    return jsFeatureMap[apiCall] || null;
}
//# sourceMappingURL=analyzer.js.map