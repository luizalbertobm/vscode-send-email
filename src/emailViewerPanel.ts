import * as vscode from 'vscode';
import { filterXSS, IFilterXSSOptions } from 'xss';
import { InboxEmail } from './emailReceiver';

const XSS_OPTIONS: IFilterXSSOptions = {
  allowList: {
    a: ['href', 'title', 'style', 'target'],
    abbr: ['title'],
    b: ['style'],
    blockquote: ['style', 'class'],
    br: [],
    caption: [],
    center: [],
    code: ['style', 'class'],
    col: ['span', 'width'],
    colgroup: ['span', 'width'],
    del: [],
    div: ['style', 'class', 'align'],
    em: ['style'],
    font: ['color', 'size', 'face', 'style'],
    h1: ['style', 'class'],
    h2: ['style', 'class'],
    h3: ['style', 'class'],
    h4: ['style', 'class'],
    h5: ['style', 'class'],
    h6: ['style', 'class'],
    hr: ['style'],
    i: ['style'],
    img: ['src', 'alt', 'title', 'width', 'height', 'style'],
    ins: [],
    li: ['style', 'class'],
    mark: [],
    ol: ['style', 'class'],
    p: ['style', 'class', 'align'],
    pre: ['style', 'class'],
    s: [],
    small: [],
    span: ['style', 'class'],
    strong: ['style'],
    sub: [],
    sup: [],
    table: ['style', 'class', 'width', 'border', 'cellpadding', 'cellspacing', 'bgcolor', 'align'],
    tbody: ['style'],
    td: ['style', 'colspan', 'rowspan', 'bgcolor', 'align', 'valign', 'width', 'height'],
    tfoot: ['style'],
    th: ['style', 'colspan', 'rowspan', 'bgcolor', 'align', 'valign', 'width', 'height'],
    thead: ['style'],
    tr: ['style', 'bgcolor', 'align', 'valign'],
    tt: [],
    u: ['style'],
    ul: ['style', 'class'],
  },
  onTagAttr(tag, name, value) {
    // Only allow safe URL schemes for href
    if (tag === 'a' && name === 'href') {
      return /^(https?:|mailto:)/i.test(value.trim()) ? undefined : '';
    }
    // Block external img src to prevent tracking pixels; allow only data URIs
    if (tag === 'img' && name === 'src') {
      return value.trim().startsWith('data:') ? undefined : '';
    }
    return undefined;
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'noscript', 'iframe', 'object', 'embed'],
};

export class EmailViewerPanel {
  static open(email: InboxEmail, _extensionUri: vscode.Uri): void {
    const title = email.subject || vscode.l10n.t('(no subject)');
    const panel = vscode.window.createWebviewPanel(
      'sendEmail.emailViewer',
      title,
      vscode.ViewColumn.Beside,
      { enableScripts: false, retainContextWhenHidden: false }
    );
    panel.webview.html = buildViewerHtml(email, panel.webview);
  }
}

function buildViewerHtml(email: InboxEmail, webview: vscode.Webview): string {
  const csp = `default-src 'none'; style-src 'unsafe-inline'; img-src data:;`;

  const bodyHtml = email.htmlBody
    ? filterXSS(email.htmlBody, XSS_OPTIONS)
    : email.textBody
    ? `<pre style="white-space: pre-wrap; word-break: break-word; font-family: var(--vscode-editor-font-family, monospace);">${escapeHtml(email.textBody)}</pre>`
    : `<em style="color: var(--vscode-descriptionForeground);">(empty)</em>`;

  const formattedDate = email.date
    ? new Date(email.date).toLocaleString()
    : '';

  function row(label: string, value: string): string {
    if (!value) { return ''; }
    return `<tr>
      <td style="font-weight:600; white-space:nowrap; padding:4px 12px 4px 0; color:var(--vscode-descriptionForeground); vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:4px 0; word-break:break-word;">${escapeHtml(value)}</td>
    </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(email.subject || '(no subject)')}</title>
  <style>
    body {
      font-family: var(--vscode-font-family, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
      margin: 0;
      padding: 0;
    }
    .header {
      border-bottom: 1px solid var(--vscode-panel-border, #444);
      padding: 16px 20px;
    }
    .header table {
      border-collapse: collapse;
      width: 100%;
    }
    .body-container {
      padding: 16px 20px;
      overflow-x: auto;
    }
    /* Scope email body styles */
    .email-body a {
      color: var(--vscode-textLink-foreground);
    }
    .email-body img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="header">
    <table>
      ${row('From', email.from)}
      ${row('To', email.to)}
      ${row('Date', formattedDate)}
      ${row('Subject', email.subject)}
    </table>
  </div>
  <div class="body-container">
    <div class="email-body">${bodyHtml}</div>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
