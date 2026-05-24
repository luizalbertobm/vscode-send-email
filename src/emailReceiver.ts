import * as vscode from 'vscode';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';

export interface InboxEmail {
  uid: number;
  from: string;
  to: string;
  subject: string;
  date: string;
  htmlBody: string | null;
  textBody: string | null;
}

export async function fetchRecentEmails(count: number): Promise<InboxEmail[]> {
  const cfg = vscode.workspace.getConfiguration('sendEmail');
  const imapHost = cfg.get<string>('imapHost', 'imap.gmail.com');
  const imapPort = cfg.get<number>('imapPort', 993);
  const user = cfg.get<string>('smtpUser', '');
  const password = cfg.get<string>('smtpPassword', '');

  if (!imapHost) {
    throw new Error(vscode.l10n.t('IMAP host is not configured.'));
  }
  if (!user || !password) {
    throw new Error(vscode.l10n.t('SMTP credentials are required to fetch emails.'));
  }

  const client = new ImapFlow({
    host: imapHost,
    port: imapPort,
    secure: true,
    auth: { user, pass: password },
    logger: false,
  });

  const emails: InboxEmail[] = [];

  try {
    await client.connect();

    const lock = await client.getMailboxLock('INBOX', { readOnly: true });
    try {
      const mailbox = client.mailbox;
      if (!mailbox || mailbox.exists === 0) {
        return [];
      }

      const total = mailbox.exists;
      const start = Math.max(1, total - count + 1);

      for await (const msg of client.fetch(`${start}:*`, { source: true })) {
        const parsed = await simpleParser(msg.source as Buffer);

        const toAddresses = Array.isArray(parsed.to)
          ? parsed.to.map((a) => a.text).join(', ')
          : (parsed.to?.text ?? '');

        emails.push({
          uid: msg.uid,
          from: parsed.from?.text ?? '',
          to: toAddresses,
          subject: parsed.subject ?? '',
          date: parsed.date?.toISOString() ?? '',
          htmlBody: typeof parsed.html === 'string' ? parsed.html : null,
          textBody: parsed.text ?? null,
        });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }

  return emails.reverse();
}
