import * as vscode from 'vscode';
import { EmailPanel } from './emailPanel';
import { EmailSidebarProvider } from './emailSidebarProvider';
import { EmailInboxProvider } from './emailInboxProvider';
import { EmailViewerPanel } from './emailViewerPanel';
import { InboxEmail } from './emailReceiver';

export function activate(context: vscode.ExtensionContext): void {
  // Activity bar sidebar form
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      EmailSidebarProvider.viewId,
      new EmailSidebarProvider()
    )
  );

  // Command Palette shortcut (also opens an editor panel)
  context.subscriptions.push(
    vscode.commands.registerCommand('sendEmail.openForm', () => {
      EmailPanel.createOrReveal(context.extensionUri);
    })
  );

  // Inbox tree view
  const inboxProvider = new EmailInboxProvider();
  context.subscriptions.push(
    vscode.window.createTreeView('sendEmail.inboxView', {
      treeDataProvider: inboxProvider,
    })
  );

  // Refresh inbox command
  context.subscriptions.push(
    vscode.commands.registerCommand('sendEmail.refreshInbox', () => {
      inboxProvider.refresh();
    })
  );

  // Open individual email command (invoked by tree item click)
  context.subscriptions.push(
    vscode.commands.registerCommand('sendEmail.openInboxEmail', (email: InboxEmail) => {
      EmailViewerPanel.open(email, context.extensionUri);
    })
  );
}

export function deactivate(): void {}
