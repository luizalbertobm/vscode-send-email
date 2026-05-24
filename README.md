# Send Email for VS Code

> Compose, send, and read emails — without leaving your editor.

[![VS Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/beecoders.bee-send-email?style=flat-square&label=Marketplace&logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=beecoders.bee-send-email)
[![GitHub Stars](https://img.shields.io/github/stars/luizalbertobm/vscode-send-email?style=flat-square&logo=github)](https://github.com/luizalbertobm/vscode-send-email/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## Overview

**Send Email** brings your Gmail inbox and compose workflow directly into VS Code. Whether you need to fire off a quick message or check an incoming email, you can do it without switching to a browser or email client.

---

## Features

| | |
|---|---|
| ✉️ **Compose from the sidebar** | Click the envelope icon in the Activity Bar to open the compose form in the sidebar panel |
| ⌨️ **Compose from the Command Palette** | Run `Email: Send Email` to open the form as a full editor tab |
| 📥 **Inbox panel** | Browse your recent emails in the Activity Bar — two-line items show subject, date, and sender at a glance |
| 📄 **Email reader** | Click any message to open it as an editor tab with rendered HTML body and full headers |
| 🖼️ **Privacy-first image loading** | External images are blocked by default; a **Load Images** button lets you opt in per message |
| 📑 **Paginated inbox** | Loads 20 emails at a time with a **Load more emails…** entry to fetch older pages |
| ♻️ **Tab reuse** | Clicking the same email twice reveals the existing tab instead of opening a duplicate |
| 🌍 **Multilingual** | UI fully translated into English, Portuguese (pt-BR), Spanish, and French |
| 🎨 **Theme-aware** | All UI surfaces use VS Code CSS variables and match your current colour theme |

---

## Requirements

- A **Gmail account** with **2-Step Verification** enabled
- A **Gmail App Password** — used instead of your regular password

> Other IMAP/SMTP providers work too — just update the host and port settings.

### Generating a Gmail App Password

1. Sign in to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Under **App passwords**, create a new entry (e.g. name it `VS Code`)
3. Copy the generated 16-character password

---

## Setup

Open **Settings** (`Ctrl+,` / `Cmd+,`) and search for **Send Email**, or add the following to your `settings.json`:

```jsonc
{
  "sendEmail.smtpUser": "you@gmail.com",
  "sendEmail.smtpPassword": "xxxx xxxx xxxx xxxx",  // 16-char app password
  "sendEmail.fromAddress": "Your Name <you@gmail.com>"  // optional
}
```

### All Settings

| Setting | Default | Description |
|---|---|---|
| `sendEmail.smtpHost` | `smtp.gmail.com` | SMTP server hostname |
| `sendEmail.smtpPort` | `465` | SMTP port (SSL) |
| `sendEmail.smtpUser` | *(required)* | Gmail address used to send emails |
| `sendEmail.smtpPassword` | *(required)* | Gmail app password |
| `sendEmail.fromAddress` | — | Display name / address shown in the From field (defaults to `smtpUser`) |
| `sendEmail.imapHost` | `imap.gmail.com` | IMAP server hostname (used by the inbox) |
| `sendEmail.imapPort` | `993` | IMAP port (SSL) |

> 🔒 **Security:** `smtpPassword` is stored as a VS Code secret. Configure it in **User Settings** (not Workspace Settings) to keep it out of project files committed to source control.

---

## Usage

### Sending an Email

**From the Activity Bar:**
1. Click the ✉️ **envelope icon** in the left Activity Bar
2. The compose form opens in the sidebar
3. Fill in **To**, **Subject**, and **Message**
4. Click **Send**

**From the Command Palette:**
1. Press `Ctrl+Shift+P` (`Cmd+Shift+P` on macOS)
2. Type `Send Email` and press Enter
3. The compose form opens as an editor panel

### Reading Your Inbox

1. Click the ✉️ **envelope icon** in the Activity Bar to expand the panel
2. Click the **↻ Refresh** button in the **Inbox** panel toolbar to load your emails
3. Each item shows the **subject** on the first line and **date · sender** on the second line
4. Click any email to open it in a reader tab in your active editor group
5. If an email contains external images, a privacy banner will appear — click **Load Images** to display them
6. Scroll to the bottom and click **Load more emails…** to fetch the next page of older messages

---

## Known Limitations

- **Send is plain-text only** — HTML composition and file attachments are not supported
- **Gmail / Google Workspace** recommended — other providers require manual host and port configuration
- The inbox reads from the **INBOX** folder only

---

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for a full version history.

---

## Contributing

Bug reports and feature requests are welcome on [GitHub Issues](https://github.com/luizalbertobm/vscode-send-email/issues).

---

## Author

**[Bee Coders](https://www.beecoders.dev)** — Developed by [Luiz Alberto B. Mesquita](https://github.com/luizalbertobm)

---

## License

[MIT](LICENSE)

