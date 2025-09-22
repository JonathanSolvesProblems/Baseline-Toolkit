import * as vscode from 'vscode';
// type BaselineReport, 
import { analyzeFile, type AnalysisContext } from '@baseline-toolkit/core';

export class BaselineDiagnosticsProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('baseline-toolkit');
  }

  public updateDiagnostics(document: vscode.TextDocument): void {
    const config = vscode.workspace.getConfiguration('baselineToolkit');
    const diagnostics: vscode.Diagnostic[] = [];

    try {
      // Get file type
      const languageId = document.languageId;
      let type: 'css' | 'js' = 'js';
      
      if (languageId === 'css' || languageId === 'scss') {
        type = 'css';
      }

      // Create analysis context
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

      // Analyze the file
      const report = analyzeFile(context);

      // Create diagnostics for risky features
      report.risky.forEach(feature => {
        // For now, we'll highlight the entire line where the feature is used
        // In a production version, we'd need more precise location tracking
        const lines = document.getText().split('\n');
        
        lines.forEach((line, lineIndex) => {
          if (line.includes(feature.id) || (feature.name && line.includes(feature.name))) {
            const range = new vscode.Range(
              lineIndex, 0,
              lineIndex, line.length
            );

            const severity = feature.baseline === false 
              ? vscode.DiagnosticSeverity.Warning 
              : vscode.DiagnosticSeverity.Information;

            const message = feature.baseline === false
              ? `Feature '${feature.id}' is not Baseline (not widely supported)`
              : `Feature '${feature.id}' is Baseline low (limited support)`;

            const diagnostic = new vscode.Diagnostic(range, message, severity);
            diagnostic.code = 'baseline-compatibility';
            diagnostic.source = 'Baseline Toolkit';
            
            // Add related information
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
      console.warn('Error analyzing document:', error);
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  public dispose(): void {
    this.diagnosticCollection.dispose();
  }
}