import * as vscode from 'vscode';
import { WebviewLabels } from './emailFormHtml';

export function getWebviewLabels(): WebviewLabels {
  return {
    language: vscode.env.language,
    title: vscode.l10n.t('Send Email'),
    labelTo: vscode.l10n.t('To'),
    placeholderTo: vscode.l10n.t('recipient@example.com'),
    labelSubject: vscode.l10n.t('Subject'),
    placeholderSubject: vscode.l10n.t('Email subject'),
    labelMessage: vscode.l10n.t('Message'),
    placeholderMessage: vscode.l10n.t('Write your message here...'),
    btnSend: vscode.l10n.t('Send'),
    btnSending: vscode.l10n.t('Sending\u2026'),
    validationFillAll: vscode.l10n.t('Please fill in all fields.'),
    successMessage: vscode.l10n.t('\u2705 Email sent successfully!'),
  };
}
