import * as vscode from 'vscode';
import { analyzeFile, type AnalysisContext } from '@baseline-toolkit/core';

export class BaselineDiagnosticsProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('baseline-toolkit');
  }

  public updateDiagnostics(document: vscode.TextDocument): void {
    const config = vscode.workspace.getConfiguration('baselineToolkit');
    const diagnostics: vscode.Diagnostic[] = [];

    // Defer analysis to avoid blocking extension host
    setTimeout(() => {
      try {
        // Determine file type
        const languageId = document.languageId;
        const type: 'css' | 'js' | 'html' =
          languageId === 'css' || languageId === 'scss' ? 'css' :
          languageId === 'html' ? 'html' : 'js';

        // Build analysis context
        const context: AnalysisContext = {
          filePath: document.uri.fsPath,
          content: document.getText(),
          type,
          config: {
            rules: {
              allowLow: config.get('rules.allowLow', false),
              blockFalse: config.get('rules.blockFalse', true),
            },
          },
        };

        // Run analysis
        const report = analyzeFile(context);
        console.log('Baseline analysis report:', report); // ✅ debug

        // Create diagnostics for risky features
        report.risky.forEach(feature => {
          const lines = document.getText().split('\n');

          lines.forEach((line, lineIndex) => {
            if (line.includes(feature.id) || (feature.name && line.includes(feature.name))) {
              const range = new vscode.Range(lineIndex, 0, lineIndex, line.length);

              const severity = feature.baseline === false
                ? vscode.DiagnosticSeverity.Warning
                : vscode.DiagnosticSeverity.Information;

              const message = feature.baseline === false
                ? `Feature '${feature.id}' is not Baseline (not widely supported)`
                : `Feature '${feature.id}' is Baseline low (limited support)`;

              const diagnostic = new vscode.Diagnostic(range, message, severity);
              diagnostic.code = 'baseline-compatibility';
              diagnostic.source = 'Baseline Toolkit';

              if (feature.mdn) {
                diagnostic.relatedInformation = [
                  new vscode.DiagnosticRelatedInformation(
                    new vscode.Location(document.uri, range),
                    `Documentation: ${feature.mdn}`
                  )
                ];
              }

              diagnostics.push(diagnostic);
            }
          });
        });

      } catch (error) {
        console.error('Error analyzing document:', error);
      }

      // Update diagnostics after processing
      this.diagnosticCollection.set(document.uri, diagnostics);
    }, 0); // defer to next event loop tick
  }

  public dispose(): void {
    this.diagnosticCollection.dispose();
  }
}
