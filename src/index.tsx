import { GitCommitHistoryPanel } from './panels/GitCommitHistoryPanel';
import { GitPullRequestsPanel } from './panels/GitPullRequestsPanel';
import type { PanelDefinition, PanelContextValue } from './types';
import {
  commitHistoryTools,
  commitHistoryToolsMetadata,
  pullRequestsTools,
  pullRequestsToolsMetadata,
} from './tools';

/**
 * Export array of panel definitions.
 * This is the required export for panel extensions.
 */
export const panels: PanelDefinition[] = [
  {
    metadata: {
      id: 'git-panels.commit-history',
      name: 'Git Commit History',
      icon: 'history',
      version: '0.1.0',
      author: 'Principal ADE',
      description: 'View recent commits from the current repository',
      slices: ['commits'],
      tools: commitHistoryTools,
    },
    component: GitCommitHistoryPanel,

    onMount: async (context: PanelContextValue) => {
      // Refresh commits data when panel mounts
      if (context.hasSlice('commits') && !context.isSliceLoading('commits')) {
        await context.refresh('repository', 'commits');
      }
    },
  },
  {
    metadata: {
      id: 'git-panels.pull-requests',
      name: 'Git Pull Requests',
      icon: 'git-pull-request',
      version: '0.1.0',
      author: 'Principal ADE',
      description: 'Review open, merged, and closed pull requests',
      slices: ['pullRequests'],
      tools: pullRequestsTools,
    },
    component: GitPullRequestsPanel,

    onMount: async (context: PanelContextValue) => {
      // Refresh PR data when panel mounts
      if (context.hasSlice('pullRequests') && !context.isSliceLoading('pullRequests')) {
        await context.refresh('repository', 'pullRequests');
      }
    },
  },
];

/**
 * Optional: Called once when the entire package is loaded.
 */
export const onPackageLoad = async () => {
  console.log('[git-panels] Package loaded');
};

/**
 * Optional: Called once when the package is unloaded.
 */
export const onPackageUnload = async () => {
  console.log('[git-panels] Package unloading');
};

/**
 * Export tools for server-safe imports.
 * Use '@principal-ade/git-panels/tools' to import without React dependencies.
 */
export {
  // Commit history tools
  commitHistoryTools,
  commitHistoryToolsMetadata,
  refreshCommitsTool,
  setCommitLimitTool,
  // Pull request tools
  pullRequestsTools,
  pullRequestsToolsMetadata,
  refreshPullRequestsTool,
  setPRFilterTool,
  // All tools
  allGitPanelTools,
} from './tools';

/**
 * Export types for consumers
 */
export type {
  GitCommitInfo,
  CommitsSliceData,
  PullRequestInfo,
  PullRequestsSliceData,
  PullRequestUser,
  PullRequestRef,
} from './types';

/**
 * Export panel components for direct use
 */
export { GitCommitHistoryPanel, GitCommitHistoryPanelPreview } from './panels/GitCommitHistoryPanel';
export { GitPullRequestsPanel, GitPullRequestsPanelPreview } from './panels/GitPullRequestsPanel';
