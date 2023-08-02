import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

export interface GithubOptions {
  userAgent?: string;
  baseUrl?: string;
  /**
   * Authorization token.
   */
  auth?: string;
  /**
   * Exclude issues with labels matching strings.
   */
  excludeWithLabel?: string[];
}

export const defaultOptions: GithubOptions = {
  baseUrl: 'https://api.github.com',
  userAgent: 'master-console v3',
  excludeWithLabel: ['blocked'],
};

const ICON_PATH = '/assets/icon-3.png';

@Injectable()
export class AppService {
  api: Octokit;
  settings = defaultOptions;

  initialize() {
    this.api = new Octokit({
      ...this.settings,
      auth: process.env.GITHUB_TOKEN,
    });
  }

  getData() {
    return this.getAssignedIssues();
  }

  /**
   * Gets user assigned issues from Github using API.
   */
  async getAssignedIssues(): Promise<any> {
    return new Promise(async (resolve) => {
      const issues = (
        await this.api.issues.list({ filter: 'assigned' })
      ).data.filter(
        (issue) => !this.hasLabel(issue, this.settings.excludeWithLabel),
      );

      const items = issues.map((issue) => {
        return {
          message: `[${issue.repository.name} #${issue.number}] ${issue.title}`,
          icon: ICON_PATH,
        };
      });

      resolve({ data: items });
    });
  }

  /**
   * Exclude issues with labels matching strings.
   */
  protected hasLabel(issue, labels = []): boolean {
    return !!issue.labels.filter((label) => labels.includes(label.name)).length;
  }
}
