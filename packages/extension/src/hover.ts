import * as vscode from 'vscode';
import { analyzeFile, type AnalysisContext } from '@baseline-toolkit/core';

export class BaselineHoverProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const config = vscode.workspace.getConfiguration('baselineToolkit');
    
    if (!config.get('showHoverInfo', true)) {
      return null;
    }

    try {
      // Get the word at the cursor position
      const wordRange = document.getWordRangeAtPosition(position);
      if (!wordRange) {
        return null;
      }

      const word = document.getText(wordRange);
      
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

      // Find feature that matches the current word
      const riskyFeature = report.risky.find(feature => 
        feature.id.includes(word) || 
        (feature.name && feature.name.toLowerCase().includes(word.toLowerCase()))
      );

      if (riskyFeature) {
        const contents = new vscode.MarkdownString();
        contents.supportHtml = true;
        contents.isTrusted = true;

        contents.appendMarkdown(`**${riskyFeature.id}**\n\n`);
        
        if (riskyFeature.baseline === false) {
          contents.appendMarkdown(`⚠️ **Not Baseline** - This feature is not widely supported across browsers.\n\n`);
        } else {
          contents.appendMarkdown(`🟡 **Baseline Low** - This feature has limited browser support.\n\n`);
        }

        if (riskyFeature.support) {
          contents.appendMarkdown('**Browser Support:**\n');
          Object.entries(riskyFeature.support).forEach(([browser, version]) => {
            if (version) {
              contents.appendMarkdown(`- ${browser}: ${version}+\n`);
            }
          });
          contents.appendMarkdown('\n');
        }

        if (riskyFeature.baselineLowDate) {
          contents.appendMarkdown(`**Baseline Low Date:** ${riskyFeature.baselineLowDate}\n`);
        }

        if (riskyFeature.baselineHighDate) {
          contents.appendMarkdown(`**Expected Baseline High:** ${riskyFeature.baselineHighDate}\n`);
        }

        if (riskyFeature.mdn) {
          contents.appendMarkdown(`\n[📖 View on MDN](${riskyFeature.mdn})`);
        }

        if (riskyFeature.spec) {
          contents.appendMarkdown(` | [📋 Specification](${riskyFeature.spec})`);
        }

        return new vscode.Hover(contents, wordRange);
      }

    } catch (error) {
      console.warn('Error providing hover information:', error);
    }

    return null;
  }
}