import * as vscode from 'vscode';
import { sendEmail } from './emailSender';
import { getFormHtml } from './emailFormHtml';

export class EmailSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = 'sendEmail.sidebarForm';

  public resolveWebviewView(view: vscode.WebviewView): void {
    view.webview.options = { enableScripts: true };
    view.webview.html = getFormHtml();

    view.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'send') {
        try {
          await sendEmail({
            to: message.to,
            subject: message.subject,
            body: message.body,
          });
          view.webview.postMessage({ command: 'result', ok: true });
          vscode.window.showInformationMessage(`Email sent to ${message.to}`);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          view.webview.postMessage({ command: 'result', ok: false, error: errorMessage });
          vscode.window.showErrorMessage(`Failed to send email: ${errorMessage}`);
        }
      }
    });
  }
}
