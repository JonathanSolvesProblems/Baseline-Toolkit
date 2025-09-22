import * as vscode from 'vscode';

export class BaselineCodeActionProvider implements vscode.CodeActionProvider {
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CodeAction[]> {
    const config = vscode.workspace.getConfiguration('baselineToolkit');
    
    if (!config.get('enableCodeActions', true)) {
      return [];
    }

    const actions: vscode.CodeAction[] = [];

    // Only provide actions for baseline-related diagnostics
    const baselineDiagnostics = context.diagnostics.filter(
      diagnostic => diagnostic.source === 'Baseline Toolkit'
    );

    if (baselineDiagnostics.length === 0) {
      return actions;
    }

    // Get the text in the problematic range
    const problemText = document.getText(range);

    // Provide specific suggestions based on common patterns
    const suggestions = this.getSuggestions(problemText, document.languageId);

    suggestions.forEach(suggestion => {
      const action = new vscode.CodeAction(
        suggestion.title,
        suggestion.kind
      );
      
      action.diagnostics = baselineDiagnostics;
      action.isPreferred = suggestion.isPreferred;

      if (suggestion.edit) {
        action.edit = new vscode.WorkspaceEdit();
        action.edit.replace(document.uri, range, suggestion.edit);
      } else if (suggestion.command) {
        action.command = suggestion.command;
      }

      actions.push(action);
    });

    return actions;
  }

  private getSuggestions(text: string, languageId: string): Array<{
    title: string;
    kind: vscode.CodeActionKind;
    isPreferred?: boolean;
    edit?: string;
    command?: vscode.Command;
  }> {
    const suggestions = [];

    // CSS-specific suggestions
    if (languageId === 'css' || languageId === 'scss') {
      if (text.includes('float:')) {
        suggestions.push({
          title: '💡 Consider using Flexbox instead of float',
          kind: vscode.CodeActionKind.QuickFix,
          isPreferred: true,
          edit: text.replace(/float\s*:\s*(left|right)/gi, 'display: flex')
        });

        suggestions.push({
          title: '💡 Consider using CSS Grid instead of float',
          kind: vscode.CodeActionKind.RefactorRewrite,
          edit: text.replace(/float\s*:\s*(left|right)/gi, 'display: grid')
        });
      }

      if (text.includes('word-break')) {
        suggestions.push({
          title: '💡 Add fallback for word-break',
          kind: vscode.CodeActionKind.QuickFix,
          edit: `overflow-wrap: break-word; /* Fallback */\n${text}`
        });
      }
    }

    // JavaScript-specific suggestions
    if (languageId.includes('javascript') || languageId.includes('typescript')) {
      if (text.includes('XMLHttpRequest')) {
        suggestions.push({
          title: '💡 Replace with fetch API',
          kind: vscode.CodeActionKind.QuickFix,
          isPreferred: true,
          edit: text.replace(/new XMLHttpRequest\(\)/gi, 'fetch(url)')
        });
      }

      if (text.includes('getElementById')) {
        suggestions.push({
          title: '💡 Use querySelector for consistency',
          kind: vscode.CodeActionKind.RefactorRewrite,
          edit: text.replace(/document\.getElementById\(/gi, 'document.querySelector(\'#')
        });
      }

      if (text.includes('IdleDetector')) {
        suggestions.push({
          title: '⚠️ Add feature detection for IdleDetector',
          kind: vscode.CodeActionKind.QuickFix,
          edit: `if ('IdleDetector' in window) {\n  ${text}\n} else {\n  // Fallback behavior\n  console.warn('IdleDetector not supported');\n}`
        });
      }
    }

    // Generic suggestions
    suggestions.push({
      title: '📖 View Baseline documentation',
      kind: vscode.CodeActionKind.Empty,
      command: {
        title: 'Open Baseline docs',
        command: 'vscode.open',
        arguments: [vscode.Uri.parse('https://web-platform-dx.github.io/web-features/')]
      }
    });

    return suggestions;
  }
}