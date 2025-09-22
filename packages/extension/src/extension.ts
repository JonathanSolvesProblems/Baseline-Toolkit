import * as vscode from 'vscode';
import { BaselineDiagnosticsProvider } from './diagnostics.js';
import { BaselineHoverProvider } from './hover.js';
import { BaselineCodeActionProvider } from './codeActions.js';

let diagnosticsProvider: BaselineDiagnosticsProvider;

export function activate(context: vscode.ExtensionContext): void {
  console.log('Baseline Toolkit extension is now active');

  // Initialize diagnostics provider
  diagnosticsProvider = new BaselineDiagnosticsProvider();

  // Register providers for different file types
  const supportedLanguages = ['css', 'scss', 'javascript', 'typescript', 'javascriptreact', 'typescriptreact'];
  
  // Register hover provider
  const hoverProvider = new BaselineHoverProvider();
  supportedLanguages.forEach(language => {
    context.subscriptions.push(
      vscode.languages.registerHoverProvider(language, hoverProvider)
    );
  });

  // Register code actions provider
  const codeActionProvider = new BaselineCodeActionProvider();
  supportedLanguages.forEach(language => {
    context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(language, codeActionProvider, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.RefactorRewrite]
      })
    );
  });

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('baselineToolkit.checkCurrentFile', () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        diagnosticsProvider.updateDiagnostics(activeEditor.document);
        vscode.window.showInformationMessage('Baseline check completed for current file');
      } else {
        vscode.window.showWarningMessage('No active file to check');
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('baselineToolkit.checkWorkspace', async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showWarningMessage('No workspace folder open');
        return;
      }

      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Checking workspace for Baseline compatibility...',
        cancellable: false
      }, async (progress) => {
        const files = await vscode.workspace.findFiles('**/*.{css,scss,js,ts,jsx,tsx}', '**/node_modules/**');
        let processed = 0;

        for (const file of files) {
          const document = await vscode.workspace.openTextDocument(file);
          diagnosticsProvider.updateDiagnostics(document);
          
          processed++;
          progress.report({ 
            increment: (processed / files.length) * 100,
            message: `${processed}/${files.length} files processed`
          });
        }
      });

      vscode.window.showInformationMessage('Workspace Baseline check completed');
    })
  );

  // Listen for document changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (isSupported(event.document.languageId)) {
        diagnosticsProvider.updateDiagnostics(event.document);
      }
    })
  );

  // Listen for document opens
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(document => {
      if (isSupported(document.languageId)) {
        diagnosticsProvider.updateDiagnostics(document);
      }
    })
  );

  // Check all open documents on activation
  vscode.workspace.textDocuments.forEach(document => {
    if (isSupported(document.languageId)) {
      diagnosticsProvider.updateDiagnostics(document);
    }
  });
}

export function deactivate(): void {
  if (diagnosticsProvider) {
    diagnosticsProvider.dispose();
  }
}

function isSupported(languageId: string): boolean {
  return ['css', 'scss', 'javascript', 'typescript', 'javascriptreact', 'typescriptreact'].includes(languageId);
}