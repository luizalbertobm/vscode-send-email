import * as vscode from 'vscode';
import { sendEmail } from './emailSender';
import { getFormHtml } from './emailFormHtml';

export class EmailPanel {
  public static readonly viewType = 'sendEmail.form';
  private static instance: EmailPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private readonly disposables: vscode.Disposable[] = [];

  public static createOrReveal(extensionUri: vscode.Uri): void {
    if (EmailPanel.instance) {
      EmailPanel.instance.panel.reveal();
      return;
    }
    EmailPanel.instance = new EmailPanel(extensionUri);
  }

  private constructor(extensionUri: vscode.Uri) {
    this.panel = vscode.window.createWebviewPanel(
      EmailPanel.viewType,
      'Send Email',
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    this.panel.webview.html = getFormHtml();

    this.panel.webview.onDidReceiveMessage(
      async (message) => {
        if (message.command === 'send') {
          try {
            await sendEmail({
              to: message.to,
              subject: message.subject,
              body: message.body,
            });
            this.panel.webview.postMessage({ command: 'result', ok: true });
            vscode.window.showInformationMessage(`Email sent to ${message.to}`);
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            this.panel.webview.postMessage({ command: 'result', ok: false, error: errorMessage });
            vscode.window.showErrorMessage(`Failed to send email: ${errorMessage}`);
          }
        }
      },
      null,
      this.disposables
    );

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
  }

  private dispose(): void {
    EmailPanel.instance = undefined;
    this.panel.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables.length = 0;
  }
}
