import { Octokit } from "@octokit/rest";
import { ProviderOptions, Provider } from "@master-list/core";

export interface GithubOptions extends ProviderOptions {
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
  providerName: "Github",
  baseUrl: "https://api.github.com",
};

export class GithubProvider extends Provider {
  api: Octokit;

  constructor(public options: GithubOptions) {
    super({
      ...defaultOptions,
      ...options,
    });
  }

  initialize(): Promise<boolean> {
    return super.initialize(async () => {
      this.api = new Octokit(this.settings);
    });
  }

  reload() {
    return super.reload(async () => {
      return await this.getAssignedIssues();
    });
  }

  /**
   * Exclude issues with labels matching strings.
   */
  hasLabel(issue, labels = []): boolean {
    return !!issue.labels.filter((label) => labels.includes(label.name)).length;
  }

  /**
   * Gets user assigned issues from Github using API.
   */
  async getAssignedIssues(): Promise<string[]> {
    return new Promise(async (resolve) => {
      const issues = (
        await this.api.issues.list({ filter: "assigned" })
      ).data.filter(
        (issue) => !this.hasLabel(issue, this.settings.excludeWithLabel)
      );

      const items = issues.map(
        (issue) => `[${issue.repository.name} #${issue.number}] ${issue.title}`
      );

      resolve(items);
    });
  }
}
