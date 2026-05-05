import * as vscode from 'vscode';
import { EmailPanel } from './emailPanel';
import { EmailSidebarProvider } from './emailSidebarProvider';

export function activate(context: vscode.ExtensionContext): void {
  // Activity bar sidebar form
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      EmailSidebarProvider.viewId,
      new EmailSidebarProvider()
    )
  );

  // Command Palette shortcut (also opens an editor panel)
  const command = vscode.commands.registerCommand('sendEmail.openForm', () => {
    EmailPanel.createOrReveal(context.extensionUri);
  });
  context.subscriptions.push(command);
}

export function deactivate(): void {}
