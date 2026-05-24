import * as vscode from 'vscode';
import { fetchEmailPage, InboxEmail } from './emailReceiver';
import { EmailViewerPanel } from './emailViewerPanel';

const PAGE_SIZE = 20;

type InboxStatus = 'empty' | 'loading' | 'loadingMore' | 'idle' | 'error';

interface EmailMeta {
  uid: number;
  subject: string;
  from: string;
  date: string;
}

export class EmailInboxProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private emails: InboxEmail[] = [];
  private offset = 0;
  private hasMore = false;
  private status: InboxStatus = 'empty';
  private errorMessage = '';

  constructor(private readonly extensionUri: vscode.Uri) {}

  async refresh(): Promise<void> {
    this.emails = [];
    this.offset = 0;
    this.hasMore = false;
    this.status = 'loading';
    this.errorMessage = '';
    this._postState();
    try {
      const result = await fetchEmailPage(0, PAGE_SIZE);
      this.emails = result.emails;
      this.hasMore = result.hasMore;
      this.offset = PAGE_SIZE;
      this.status = 'idle';
    } catch (err) {
      this.status = 'error';
      this.errorMessage = err instanceof Error ? err.message : String(err);
      this.emails = [];
    }
    this._postState();
  }

  async loadMore(): Promise<void> {
    if (this.status !== 'idle' || !this.hasMore) {
      return;
    }
    this.status = 'loadingMore';
    this._postState();
    try {
      const result = await fetchEmailPage(this.offset, PAGE_SIZE);
      this.emails = [...this.emails, ...result.emails];
      this.hasMore = result.hasMore;
      this.offset += PAGE_SIZE;
      this.status = 'idle';
    } catch (err) {
      this.status = 'error';
      this.errorMessage = err instanceof Error ? err.message : String(err);
    }
    this._postState();
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this._buildHtml();

    webviewView.webview.onDidReceiveMessage((msg) => {
      switch (msg.command) {
        case 'openEmail': {
          const email = this.emails.find((e) => e.uid === msg.uid);
          if (email) {
            EmailViewerPanel.open(email, this.extensionUri);
          }
          break;
        }
        case 'loadMore':
          this.loadMore();
          break;
      }
    });

    this._postState();
  }

  private _postState(): void {
    if (!this._view) {
      return;
    }
    const metas: EmailMeta[] = this.emails.map((e) => ({
      uid: e.uid,
      subject: e.subject,
      from: e.from,
      date: e.date,
    }));
    this._view.webview.postMessage({
      command: 'setState',
      status: this.status,
      emails: metas,
      hasMore: this.hasMore,
      errorMessage: this.errorMessage,
    });
  }

  private _buildHtml(): string {
    const nonce = getNonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body {
      padding: 0; margin: 0;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
    }
    .email-item {
      padding: 6px 10px;
      cursor: pointer;
      border-bottom: 1px solid var(--vscode-list-inactiveSelectionBackground);
      overflow: hidden;
    }
    .email-item:hover { background: var(--vscode-list-hoverBackground); }
    .email-subject {
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .email-meta {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 2px;
    }
    .status-msg {
      padding: 16px 10px;
      color: var(--vscode-descriptionForeground);
      text-align: center;
      font-size: 12px;
    }
    .load-more {
      padding: 8px 10px;
      cursor: pointer;
      color: var(--vscode-textLink-foreground);
      text-align: center;
      font-size: 12px;
    }
    .load-more:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div id="root"><div class="status-msg">Click &#8635; to load emails.</div></div>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', (event) => {
      if (event.data.command === 'setState') render(event.data);
    });

    function esc(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function render({ status, emails, hasMore, errorMessage }) {
      const root = document.getElementById('root');

      if (status === 'loading') {
        root.innerHTML = '<div class="status-msg">Loading\u2026</div>';
        return;
      }
      if (status === 'error') {
        root.innerHTML = '<div class="status-msg">' + esc(errorMessage || 'Error loading emails.') + '</div>';
        return;
      }
      if (status === 'empty') {
        root.innerHTML = '<div class="status-msg">Click &#8635; to load emails.</div>';
        return;
      }
      if (emails.length === 0) {
        root.innerHTML = '<div class="status-msg">No messages found.</div>';
        return;
      }

      let html = '';
      for (const email of emails) {
        const date = email.date ? new Date(email.date).toLocaleString() : '';
        const meta = [date, email.from].filter(Boolean).join(' \u00b7 ');
        html += '<div class="email-item" data-uid="' + email.uid + '">'
          + '<div class="email-subject">' + esc(email.subject || '(no subject)') + '</div>'
          + '<div class="email-meta">' + esc(meta) + '</div>'
          + '</div>';
      }

      if (status === 'loadingMore') {
        html += '<div class="status-msg">Loading\u2026</div>';
      } else if (hasMore) {
        html += '<div class="load-more" id="loadMoreBtn">Load more emails\u2026</div>';
      }

      root.innerHTML = html;

      root.querySelectorAll('.email-item').forEach((el) => {
        el.addEventListener('click', () => {
          vscode.postMessage({ command: 'openEmail', uid: parseInt(el.dataset.uid, 10) });
        });
      });

      const btn = document.getElementById('loadMoreBtn');
      if (btn) {
        btn.addEventListener('click', () => vscode.postMessage({ command: 'loadMore' }));
      }
    }
  </script>
</body>
</html>`;
  }
}

function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}

