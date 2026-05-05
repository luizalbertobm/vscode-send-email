# Changelog

All notable changes to **Send Email** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
