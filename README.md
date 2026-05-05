# VSCode Send Email

> Compose and send plain-text emails without leaving VS Code.

[![GitHub Repo stars](https://img.shields.io/github/stars/luizalbertobm/vscode-send-email?style=plastic&logo=github)](https://github.com/luizalbertobm/vscode-send-email/stargazers)
[![VS Marketplace](https://img.shields.io/badge/vscode-send_email?style=plastic&label=Marketplace&logo=metrodeparis)](https://marketplace.visualstudio.com/items?itemName=beecoders.send-email)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=plastic)](LICENSE)


---

## Features

- **Activity Bar shortcut** — click the ✉️ envelope icon in the sidebar to open the email form instantly
- **Command Palette** — run `Email: Send Email` from anywhere in VS Code
- **Simple form** — fill in To, Subject and Message, then click Send
- **Gmail SMTP** — sends via your own Gmail account using an app password
- **No browser, no switching context** — everything stays inside VS Code

---

## Requirements

- A Gmail account with **2-Step Verification** enabled
- A **Gmail App Password** (not your regular Gmail password)

### How to generate a Gmail App Password

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already on
3. Open **App passwords**
4. Create a new app password (e.g. name it `VS Code`)
5. Copy the 16-character password — you'll paste it into the extension settings

---

## Setup

Open **Settings** (`Ctrl+,`) and search for **Send Email**, or edit your `settings.json` directly:

```json
{
  "sendEmail.smtpUser": "you@gmail.com",
  "sendEmail.smtpPassword": "your-16-char-app-password",
  "sendEmail.fromAddress": "Your Name <you@gmail.com>"
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `sendEmail.smtpHost` | `smtp.gmail.com` | SMTP server hostname |
| `sendEmail.smtpPort` | `465` | SMTP port (SSL) |
| `sendEmail.smtpUser` | — | Your Gmail address |
| `sendEmail.smtpPassword` | — | Gmail app password |
| `sendEmail.fromAddress` | — | From display name/address (defaults to smtpUser) |

---

## Usage

### From the Activity Bar
1. Click the **✉️ envelope icon** in the left Activity Bar
2. The email form opens in the sidebar
3. Fill in **To**, **Subject**, **Message**
4. Click **Send**

### From the Command Palette
1. Press `Ctrl+Shift+P`
2. Type `Send Email`
3. Press Enter — the form opens as an editor panel

---

## Extension Settings

All settings are under the `sendEmail` namespace and can be configured per-user or per-workspace.

> ⚠️ **Security note:** Use a Gmail **App Password**, not your main account password. App passwords are revocable independently. Avoid committing workspace `settings.json` files containing your password to source control.

---

## Known Limitations

- Supports **plain-text** emails only (no HTML or attachments in this version)
- Requires a Gmail account (other SMTP providers work if you update host/port settings)
- The app password is stored in VS Code settings — use **User Settings** (not Workspace) to keep it off disk in shared projects

---

## Release Notes

See [CHANGELOG.md](CHANGELOG.md).

---

## Author

**[Bee Coders](https://www.beecoders.dev)** — Developed by Luiz Alberto B. Mesquita

---

## License

[MIT](LICENSE)
