/**
 * Translated strings injected into the webview HTML at render time.
 * Populated from the extension host using vscode.l10n.t().
 */
export interface WebviewLabels {
  language: string;
  title: string;
  labelTo: string;
  placeholderTo: string;
  labelSubject: string;
  placeholderSubject: string;
  labelMessage: string;
  placeholderMessage: string;
  btnSend: string;
  btnSending: string;
  validationFillAll: string;
  successMessage: string;
}

/**
 * Returns the shared HTML for the email compose form.
 * Used by both the editor WebviewPanel and the sidebar WebviewView.
 */
export function getFormHtml(labels: WebviewLabels): string {
  return /* html */ `<!DOCTYPE html>
<html lang="${labels.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${labels.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 16px;
    }

    h2 {
      font-size: 1.1em;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--vscode-foreground);
    }

    .field {
      margin-bottom: 12px;
    }

    label {
      display: block;
      font-size: 0.85em;
      font-weight: 600;
      margin-bottom: 5px;
      color: var(--vscode-foreground);
      opacity: 0.85;
    }

    input, textarea {
      width: 100%;
      padding: 6px 8px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border, #555);
      border-radius: 3px;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      outline: none;
    }

    input:focus, textarea:focus {
      border-color: var(--vscode-focusBorder);
    }

    textarea {
      resize: vertical;
      min-height: 120px;
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 3px;
      font-size: var(--vscode-font-size);
      font-family: var(--vscode-font-family);
      cursor: pointer;
      width: 100%;
      justify-content: center;
    }

    button:hover { background: var(--vscode-button-hoverBackground); }
    button:disabled { opacity: 0.5; cursor: not-allowed; }

    #status {
      margin-top: 12px;
      padding: 8px 12px;
      border-radius: 3px;
      display: none;
      font-size: 0.85em;
      line-height: 1.4;
      word-break: break-word;
    }

    #status.success {
      background: var(--vscode-diffEditor-insertedLineBackground, rgba(0,200,0,0.1));
      border: 1px solid var(--vscode-gitDecoration-addedResourceForeground, #4caf50);
      color: var(--vscode-gitDecoration-addedResourceForeground, #4caf50);
    }

    #status.error {
      background: var(--vscode-inputValidation-errorBackground, rgba(255,0,0,0.1));
      border: 1px solid var(--vscode-inputValidation-errorBorder, #f44336);
      color: var(--vscode-errorForeground, #f44336);
    }
  </style>
</head>
<body>
  <h2>✉️ ${labels.title}</h2>

  <div class="field">
    <label for="to">${labels.labelTo}</label>
    <input id="to" type="email" placeholder="${labels.placeholderTo}" />
  </div>

  <div class="field">
    <label for="subject">${labels.labelSubject}</label>
    <input id="subject" type="text" placeholder="${labels.placeholderSubject}" />
  </div>

  <div class="field">
    <label for="body">${labels.labelMessage}</label>
    <textarea id="body" placeholder="${labels.placeholderMessage}"></textarea>
  </div>

  <button id="sendBtn" onclick="sendEmail()">${labels.btnSend}</button>

  <div id="status"></div>

  <script>
    const vscode = acquireVsCodeApi();
    const i18n = {
      btnSend: ${JSON.stringify(labels.btnSend)},
      btnSending: ${JSON.stringify(labels.btnSending)},
      validationFillAll: ${JSON.stringify(labels.validationFillAll)},
      successMessage: ${JSON.stringify(labels.successMessage)},
    };

    function sendEmail() {
      const to = document.getElementById('to').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const body = document.getElementById('body').value.trim();

      if (!to || !subject || !body) {
        showStatus(i18n.validationFillAll, false);
        return;
      }

      const btn = document.getElementById('sendBtn');
      btn.disabled = true;
      btn.textContent = i18n.btnSending;
      hideStatus();

      vscode.postMessage({ command: 'send', to, subject, body });
    }

    window.addEventListener('message', (event) => {
      const msg = event.data;
      const btn = document.getElementById('sendBtn');
      btn.disabled = false;
      btn.textContent = i18n.btnSend;

      if (msg.command === 'result') {
        if (msg.ok) {
          showStatus(i18n.successMessage, true);
          document.getElementById('to').value = '';
          document.getElementById('subject').value = '';
          document.getElementById('body').value = '';
        } else {
          showStatus('❌ ' + msg.error, false);
        }
      }
    });

    function showStatus(message, success) {
      const el = document.getElementById('status');
      el.textContent = message;
      el.className = success ? 'success' : 'error';
      el.style.display = 'block';
    }

    function hideStatus() {
      document.getElementById('status').style.display = 'none';
    }
  </script>
</body>
</html>`;
}
