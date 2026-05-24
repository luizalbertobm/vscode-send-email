# Changelog

All notable changes to **Send Email** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.2] — 2026-05-24

### Changed
- Updated README with professional layout: feature table, settings reference table, step-by-step usage guide for compose and inbox, security note, and known limitations
- Fixed CHANGELOG history: separated v1.3.0 and v1.3.1 entries; added missing v1.1.1 and v1.1.2 entries

## [1.3.1] — 2026-05-24

### Changed
- Inbox email list now displays **two lines per item**: subject on the first line and date · sender on the second line, making it easier to scan messages at a glance
- Inbox panel is now rendered as a custom webview instead of a native tree view to support the richer per-item layout

## [1.3.0] — 2026-05-24

### Added
- **Paginated inbox** — the inbox loads the 20 most recent emails on refresh. A **Load more emails…** entry appears at the bottom whenever older messages are available; clicking it fetches the next 20 and appends them to the list without losing the already-loaded items

## [1.2.4] — 2026-05-24

### Changed
- Email viewer now opens in the **active editor group** (same tab row as code files) instead of always creating a split panel to the right
- Clicking the same email a second time now **reveals the existing tab** instead of opening a duplicate

## [1.2.3] — 2026-05-24

### Added
- **Load Images button** in the email viewer — external images are blocked by default to protect privacy (no tracking pixels without consent). A dismissable banner appears at the top of messages that contain remote images; clicking **Load Images** reloads the message with images enabled for that session

## [1.2.2] — 2026-05-24

### Fixed
- Restored `smtp.gmail.com` and `imap.gmail.com` as the pre-filled defaults in the Settings UI. VS Code's `cfg.get()` already returns the schema default when a key is absent from `settings.json`, so both the UI pre-fill and the runtime fallback work correctly without the value needing to be written to disk

## [1.2.1] — 2026-05-24

### Fixed
- Settings UI changes to `sendEmail.smtpHost` and `sendEmail.imapHost` now always persist to `settings.json`. Previously, values matching the schema default were silently omitted by VS Code

### Changed
- Inbox now fetches up to **20** most recent emails (up from 10)

## [1.2.0] — 2026-05-24

### Added
- **Inbox view** in the Activity Bar sidebar — lists recent emails fetched via IMAP
- **Email viewer panel** — click any message to open it as an editor tab with full headers (From, To, Date, Subject) and a rendered HTML or plain-text body
- **Refresh Inbox** toolbar button
- New settings: `sendEmail.imapHost` (default: `imap.gmail.com`) and `sendEmail.imapPort` (default: `993`)
- HTML bodies are sanitized with `xss` before rendering to prevent script injection
- All new strings translated to **pt-BR**, **fr**, and **es**

## [1.1.2] — 2026-05-06

### Fixed
- Updated Gmail App Password links across README and all locale files to point directly to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

## [1.1.1] — 2026-05-06

### Changed
- Updated Activity Bar icon (`media/icon.svg`)

## [1.1.0] — 2026-05-06

### Added
- Internationalization (i18n) support for **Portuguese (pt-BR)**, **French (fr)**, and **Spanish (es)**
- All user-visible strings — command names, setting descriptions, notifications, error messages, and the compose form — are fully translated
- HTML `lang` attribute on the compose webview is now locale-aware

## [1.0.0] — 2026-05-06

### Changed
- Updated README with clearer setup instructions and usage examples
- Added `.github/copilot-instructions.md` for Copilot-assisted development

## [0.1.0] — 2026-05-05

### Added
- Activity Bar envelope icon — one-click access to the email compose form
- Email compose form with **To**, **Subject**, and **Message** fields
- Send button with loading state and inline success/error feedback
- Gmail SMTP support via **nodemailer** (port 465, SSL)
- Extension settings: `smtpHost`, `smtpPort`, `smtpUser`, `smtpPassword`, `fromAddress`
- `smtpPassword` marked as `secret` so VS Code stores it securely
- Command Palette command `Email: Send Email` that opens the form as an editor panel
- VS Code theme-aware UI using CSS variables

