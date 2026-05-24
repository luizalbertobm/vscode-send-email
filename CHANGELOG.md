# Changelog

All notable changes to **Send Email** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.4] — 2026-05-24

### Changed
- Email viewer now opens in the **active editor group** (same tab row as code files) instead of always creating a split panel to the right
- Clicking the same email a second time now **reveals the existing tab** instead of opening a duplicate

## [1.2.3] — 2026-05-24

### Added
- **Load Images button** in the email viewer — external images are blocked by default to protect privacy (no tracking pixels loaded without consent). A banner appears at the top of emails that contain remote images, with a **Load Images** button that reloads the email with images enabled.

### Changed
- Email viewer now uses `enableScripts: true` to support the Load Images button interaction

## [1.2.2] — 2026-05-24

### Fixed
- Restored `smtp.gmail.com` and `imap.gmail.com` as the pre-filled defaults in the Settings UI. VS Code's `cfg.get()` always returns the schema default when a key is absent from `settings.json`, so both the UI pre-fill and the runtime fallback work correctly without the key needing to be written to `settings.json`.

## [1.2.1] — 2026-05-24

### Fixed
- `sendEmail.smtpHost` and `sendEmail.imapHost` settings now always persist to `settings.json` when changed in the UI. Previously, setting them to their default values (`smtp.gmail.com` / `imap.gmail.com`) was silently dropped by VS Code because the value matched the schema default. Defaults are now `""` and the descriptions document the fallback value used when left empty.

### Changed
- Inbox now fetches the **20** most recent emails (up from 10)

## [1.2.0] — 2026-05-24

### Added
- **Inbox view** in the Activity Bar sidebar — lists the 10 most recent emails fetched via IMAP
- **Email viewer panel** — click any message in the inbox to open it as an editor tab beside the current file, with full header info (From, To, Date, Subject) and rendered HTML or plain-text body
- **Refresh Inbox** button in the inbox view toolbar
- New extension settings: `sendEmail.imapHost` (default: `imap.gmail.com`) and `sendEmail.imapPort` (default: `993`) to configure the IMAP connection
- HTML email bodies are sanitized with `xss` before display to prevent script injection
- All new strings translated to **pt-BR**, **fr**, and **es**

## [1.1.0] — 2026-05-06

### Added
- Internationalization (i18n) support for **Portuguese (pt-BR)**, **French (fr)**, and **Spanish (es)**
- All user-visible strings in the extension — command names, setting descriptions, notifications, error messages, and the compose form — are now fully translated
- HTML `lang` attribute on the webview form is now locale-aware

## [1.0.0] — 2026-05-06

### Changed
- Updated README with clearer setup instructions and usage examples
- Added `.github/copilot-instructions.md` for Copilot-assisted development

## [0.1.0] — 2026-05-05

### Added
- Activity Bar envelope icon — one-click access to the email form from the VS Code sidebar
- Email compose form with **To**, **Subject**, and **Message** fields
- Send button with loading state and inline success/error feedback
- Gmail SMTP support via **nodemailer** (port 465, SSL)
- Extension settings: `smtpHost`, `smtpPort`, `smtpUser`, `smtpPassword`, `fromAddress`
- `smtpPassword` marked as `secret` so VS Code handles it as sensitive data
- Command Palette command `Email: Send Email` that opens the form as an editor panel
- VS Code theme-aware UI using CSS variables
