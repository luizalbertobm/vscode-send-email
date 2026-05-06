import * as vscode from 'vscode';
import { sendEmail } from './emailSender';
import { getFormHtml } from './emailFormHtml';
import { getWebviewLabels } from './i18n';

export class EmailSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = 'sendEmail.sidebarForm';

  public resolveWebviewView(view: vscode.WebviewView): void {
    view.webview.options = { enableScripts: true };
    view.webview.html = getFormHtml(getWebviewLabels());

    view.webview.onDidReceiveMessage(async (message) => {
      if (message.command === 'send') {
        try {
          await sendEmail({
            to: message.to,
            subject: message.subject,
            body: message.body,
          });
          view.webview.postMessage({ command: 'result', ok: true });
          vscode.window.showInformationMessage(vscode.l10n.t('Email sent to {0}', message.to));
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          view.webview.postMessage({ command: 'result', ok: false, error: errorMessage });
          vscode.window.showErrorMessage(vscode.l10n.t('Failed to send email: {0}', errorMessage));
        }
      }
    });
  }
}
