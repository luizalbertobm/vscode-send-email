import * as nodemailer from 'nodemailer';
import * as vscode from 'vscode';

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const cfg = vscode.workspace.getConfiguration('sendEmail');
  const host = cfg.get<string>('smtpHost', 'smtp.gmail.com');
  const port = cfg.get<number>('smtpPort', 465);
  const user = cfg.get<string>('smtpUser', '');
  const password = cfg.get<string>('smtpPassword', '');
  const from = cfg.get<string>('fromAddress', '') || user;

  if (!user || !password) {
    throw new Error(
      'Gmail credentials not configured. Open Settings and fill in sendEmail.smtpUser and sendEmail.smtpPassword.'
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: true, // SSL on port 465
    auth: { user, pass: password },
  });

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.body,
  });
}
