import * as vscode from 'vscode';
import { fetchEmailPage, InboxEmail } from './emailReceiver';

const PAGE_SIZE = 20;

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
  private offset = 0;
  private hasMore = false;
  private status: 'idle' | 'loading' | 'loadingMore' | 'error' = 'idle';
  private errorMessage = '';

  async refresh(): Promise<void> {
    this.emails = [];
    this.offset = 0;
    this.hasMore = false;
    this.status = 'loading';
    this._onDidChangeTreeData.fire();
    try {
      const result = await fetchEmailPage(0, PAGE_SIZE);
      this.emails = result.emails;
      this.hasMore = result.hasMore;
      this.offset = PAGE_SIZE;
      this.status = 'idle';
    } catch (err) {
      this.status = 'error';
      this.errorMessage = err instanceof Error ? err.message : String(err);
      this.emails = [];
    }
    this._onDidChangeTreeData.fire();
  }

  async loadMore(): Promise<void> {
    if (this.status === 'loading' || this.status === 'loadingMore' || !this.hasMore) {
      return;
    }
    this.status = 'loadingMore';
    this._onDidChangeTreeData.fire();
    try {
      const result = await fetchEmailPage(this.offset, PAGE_SIZE);
      this.emails = [...this.emails, ...result.emails];
      this.hasMore = result.hasMore;
      this.offset += PAGE_SIZE;
      this.status = 'idle';
    } catch (err) {
      this.status = 'error';
      this.errorMessage = err instanceof Error ? err.message : String(err);
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

    const items = this.emails.map((email) => {
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

    if (this.hasMore) {
      const isLoadingMore = this.status === 'loadingMore';
      items.push(
        new InboxTreeItem(
          isLoadingMore ? vscode.l10n.t('Loading...') : vscode.l10n.t('Load more emails...'),
          {
            icon: new vscode.ThemeIcon(isLoadingMore ? 'loading~spin' : 'chevron-down'),
            command: isLoadingMore
              ? undefined
              : { command: 'sendEmail.loadMoreEmails', title: '' },
          }
        )
      );
    }

    return items;
  }
}
