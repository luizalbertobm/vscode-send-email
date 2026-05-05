# Copilot Instructions

## Build & Development Commands

```bash
npm run build       # One-time build via esbuild → dist/extension.js
npm run watch       # Rebuild on file changes (dev mode)
npm run package     # Build + vsce package → .vsix file
npm run publish     # Build + vsce publish to Marketplace
```

There is no test suite or linter configured in this project.

TypeScript type-checking (without emitting) can be run directly:
```bash
npx tsc --noEmit
```

## Architecture

This is a VS Code extension that provides two entry points into the same email compose form:

1. **Activity Bar sidebar** — `EmailSidebarProvider` (`emailSidebarProvider.ts`) registers as a `WebviewViewProvider` for the `sendEmail.sidebarForm` view.
2. **Editor panel** — `EmailPanel` (`emailPanel.ts`) opens a `WebviewPanel` via the `sendEmail.openForm` command (Command Palette). Uses a singleton pattern with `createOrReveal`.

Both surfaces render the same HTML from `getFormHtml()` (`emailFormHtml.ts`) and communicate with the extension host via the same webview message protocol:
- Webview → host: `{ command: 'send', to, subject, body }`
- Host → webview: `{ command: 'result', ok: boolean, error?: string }`

Email sending is handled in `emailSender.ts` via **nodemailer**, reading SMTP config from `vscode.workspace.getConfiguration('sendEmail')` at send time (not cached).

**Bundle**: esbuild bundles `src/extension.ts` → `dist/extension.js` (CJS, Node platform). The `vscode` module is externalized. `tsconfig.json` is used for IDE tooling and type-checking only — the `outDir: "out"` in tsconfig is unused; esbuild controls the output.

## Key Conventions

- All VS Code settings live under the `sendEmail` namespace (`sendEmail.smtpHost`, `sendEmail.smtpUser`, etc.).
- The webview HTML is a single inline string function in `emailFormHtml.ts` — no separate HTML files. Styling uses VS Code CSS variables (`--vscode-*`) throughout for theme compatibility.
- TypeScript strict mode is enabled (`"strict": true` in tsconfig).
- Errors from `nodemailer` are caught and surfaced both via `vscode.window.showErrorMessage` and `postMessage` to the webview; always handle `unknown` errors with the `err instanceof Error ? err.message : String(err)` pattern.
- `smtpPassword` is declared as `"secret": true` in `package.json` — do not change this setting to a non-secret type.
- The extension sends **plain-text only** (`text:` field in nodemailer, not `html:`).
