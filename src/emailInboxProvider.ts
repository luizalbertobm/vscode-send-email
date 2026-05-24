import * as vscode from 'vscode';
import { fetchRecentEmails, InboxEmail } from './emailReceiver';

class InboxTreeItem extends vscode.TreeItem {
  constructor(
    label: string,
    options?: {
      description?: string;
      tooltip?: string;
      icon?: vscode.ThemeIcon;
      command?: vscode.Command;
    }
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    if (options) {
      this.description = options.description;
      this.tooltip = options.tooltip;
      this.iconPath = options.icon;
      this.command = options.command;
    }
  }
}

export class EmailInboxProvider implements vscode.TreeDataProvider<InboxTreeItem> {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private emails: InboxEmail[] = [];
  private status: 'idle' | 'loading' | 'error' = 'idle';
  private errorMessage = '';

  async refresh(): Promise<void> {
    this.status = 'loading';
    this._onDidChangeTreeData.fire();
    try {
      this.emails = await fetchRecentEmails(20);
      this.status = 'idle';
    } catch (err) {
      this.status = 'error';
      this.errorMessage = err instanceof Error ? err.message : String(err);
      this.emails = [];
    }
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: InboxTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): InboxTreeItem[] {
    if (this.status === 'loading') {
      return [
        new InboxTreeItem(vscode.l10n.t('Loading...'), {
          icon: new vscode.ThemeIcon('loading~spin'),
        }),
      ];
    }

    if (this.status === 'error') {
      return [
        new InboxTreeItem(this.errorMessage, {
          tooltip: this.errorMessage,
          icon: new vscode.ThemeIcon('error'),
        }),
      ];
    }

    if (this.emails.length === 0) {
      return [
        new InboxTreeItem(vscode.l10n.t('No messages found.'), {
          icon: new vscode.ThemeIcon('info'),
        }),
      ];
    }

    return this.emails.map((email) => {
      const dateLabel = email.date
        ? new Date(email.date).toLocaleString()
        : '';

      return new InboxTreeItem(email.subject || vscode.l10n.t('(no subject)'), {
        description: email.from,
        tooltip: dateLabel,
        icon: new vscode.ThemeIcon('mail'),
        command: {
          command: 'sendEmail.openInboxEmail',
          title: '',
          arguments: [email],
        },
      });
    });
  }
}
