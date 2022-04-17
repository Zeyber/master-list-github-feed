import { Octokit } from "@octokit/rest";
import { ProviderOptions, Provider } from "master-list";

export interface OctokitOptions extends ProviderOptions {
  auth?: any;
  userAgent?: string;
  baseUrl?: string;
  delayInit?: number;
  refreshInterval?: number;
  label?: string;
  hideWithLabel?: string[];
  filterRepo?: string[];
}

export const defaultOptions: OctokitOptions = {
  providerName: "Github",
};

export class GithubProvider extends Provider {
  private api: Octokit;

  constructor(public options: OctokitOptions) {
    super({
      ...defaultOptions,
      ...options,
    });
  }

  initialize(): Promise<boolean> {
    return super.initialize(async () => {
      this.api = new Octokit(this.options);
    });
  }

  reload() {
    return super.reload(async () => {
      return await this.getIssues();
    });
  }

  hideIssuesWithLabels(issues, labels = []) {
    return issues.filter((issue) => {
      return !issue.labels.filter((label) => labels.includes(label.name))
        .length;
    });
  }

  filterIssuesFromRepo(issues, repos = []) {
    return issues.filter((issue) => {
      return repos.includes(issue.repository.name);
    });
  }

  async getIssues(): Promise<string[]> {
    return new Promise(async (resolve, reject) => {
      let issues = await (
        await this.api.issues.list({ filter: "assigned" })
      ).data;
      issues = this.hideIssuesWithLabels(issues, this.options.hideWithLabel);
      issues = this.filterIssuesFromRepo(issues, this.options.filterRepo);
      const items = issues.map(
        (issue) => `[${issue.repository.name} #${issue.number}] ${issue.title}`
      );
      resolve(items);
    });
  }
}
