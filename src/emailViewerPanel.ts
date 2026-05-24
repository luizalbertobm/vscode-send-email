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

// Same as XSS_OPTIONS but allows https: src on images
const XSS_OPTIONS_WITH_IMAGES: IFilterXSSOptions = {
  ...XSS_OPTIONS,
  onTagAttr(tag, name, value) {
    if (tag === 'a' && name === 'href') {
      return /^(https?:|mailto:)/i.test(value.trim()) ? undefined : '';
    }
    if (tag === 'img' && name === 'src') {
      return /^(https?:|data:)/i.test(value.trim()) ? undefined : '';
    }
    return undefined;
  },
};

export class EmailViewerPanel {
  static open(email: InboxEmail, _extensionUri: vscode.Uri): void {
    const title = email.subject || vscode.l10n.t('(no subject)');
    const panel = vscode.window.createWebviewPanel(
      'sendEmail.emailViewer',
      title,
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: false }
    );

    panel.webview.html = buildViewerHtml(email, panel.webview, false);

    panel.webview.onDidReceiveMessage((msg) => {
      if (msg.command === 'loadImages') {
        panel.webview.html = buildViewerHtml(email, panel.webview, true);
      }
    });
  }
}

function hasExternalImages(html: string): boolean {
  return /<img[^>]+src\s*=\s*["']https?:/i.test(html);
}

function buildViewerHtml(email: InboxEmail, _webview: vscode.Webview, imagesEnabled: boolean): string {
  const imgSrc = imagesEnabled ? `img-src https: data:;` : `img-src data:;`;
  const csp = `default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; ${imgSrc}`;

  const xssOptions = imagesEnabled ? XSS_OPTIONS_WITH_IMAGES : XSS_OPTIONS;

  const bodyHtml = email.htmlBody
    ? filterXSS(email.htmlBody, xssOptions)
    : email.textBody
    ? `<pre style="white-space: pre-wrap; word-break: break-word; font-family: var(--vscode-editor-font-family, monospace);">${escapeHtml(email.textBody)}</pre>`
    : `<em style="color: var(--vscode-descriptionForeground);">(empty)</em>`;

  const formattedDate = email.date
    ? new Date(email.date).toLocaleString()
    : '';

  const showBanner = !imagesEnabled && email.htmlBody !== null && hasExternalImages(email.htmlBody);

  function row(label: string, value: string): string {
    if (!value) { return ''; }
    return `<tr>
      <td style="font-weight:600; white-space:nowrap; padding:4px 12px 4px 0; color:var(--vscode-descriptionForeground); vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:4px 0; word-break:break-word;">${escapeHtml(value)}</td>
    </tr>`;
  }

  const banner = showBanner ? `
  <div id="img-banner" style="
    display:flex; align-items:center; gap:12px;
    padding:8px 20px;
    background:var(--vscode-editorWidget-background, #252526);
    border-bottom:1px solid var(--vscode-panel-border, #444);
    font-size:var(--vscode-font-size,13px);
    color:var(--vscode-foreground);
  ">
    <span style="flex:1;">⚠️ Images are blocked to protect your privacy.</span>
    <button onclick="(function(){const vsc=acquireVsCodeApi();vsc.postMessage({command:'loadImages'});})()" style="
      cursor:pointer;
      padding:4px 12px;
      background:var(--vscode-button-background);
      color:var(--vscode-button-foreground);
      border:none;
      border-radius:2px;
      font-size:var(--vscode-font-size,13px);
    ">Load Images</button>
  </div>` : '';

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
  ${banner}
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

