/**
 * Panel Tools
 *
 * UTCP-compatible tools for the git panels extension.
 * These tools can be invoked by AI agents and emit events that panels listen for.
 *
 * IMPORTANT: This file should NOT import any React components to ensure
 * it can be imported server-side without pulling in React dependencies.
 * Use the './tools' subpath export for server-safe imports.
 */

import type { PanelTool, PanelToolsMetadata } from '@principal-ade/panel-framework-core';

// ============================================================================
// Git Commit History Panel Tools
// ============================================================================

/**
 * Tool: Refresh Commits
 */
export const refreshCommitsTool: PanelTool = {
  name: 'refresh_commits',
  description: 'Refreshes the commit history display',
  inputs: {
    type: 'object',
    properties: {
      force: {
        type: 'boolean',
        description: 'Force refresh even if data is fresh',
      },
    },
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
    },
  },
  tags: ['git', 'commits', 'refresh'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'git-panels.commit-history:refresh',
  },
};

/**
 * Tool: Set Commit Limit
 */
export const setCommitLimitTool: PanelTool = {
  name: 'set_commit_limit',
  description: 'Sets the maximum number of commits to display',
  inputs: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Maximum number of commits to show (1-100)',
      },
    },
    required: ['limit'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      limit: { type: 'number' },
    },
  },
  tags: ['git', 'commits', 'display'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'git-panels.commit-history:set-limit',
  },
};

/**
 * All commit history panel tools
 */
export const commitHistoryTools: PanelTool[] = [
  refreshCommitsTool,
  setCommitLimitTool,
];

/**
 * Commit history panel tools metadata
 */
export const commitHistoryToolsMetadata: PanelToolsMetadata = {
  id: 'git-panels.commit-history',
  name: 'Git Commit History',
  description: 'Tools for the git commit history panel',
  tools: commitHistoryTools,
};

// ============================================================================
// Pull Requests Panel Tools
// ============================================================================

/**
 * Tool: Refresh Pull Requests
 */
export const refreshPullRequestsTool: PanelTool = {
  name: 'refresh_pull_requests',
  description: 'Refreshes the pull requests display',
  inputs: {
    type: 'object',
    properties: {
      force: {
        type: 'boolean',
        description: 'Force refresh even if data is fresh',
      },
    },
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
    },
  },
  tags: ['git', 'pull-requests', 'refresh'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'git-panels.pull-requests:refresh',
  },
};

/**
 * Tool: Set PR Filter
 */
export const setPRFilterTool: PanelTool = {
  name: 'set_pr_filter',
  description: 'Sets the pull request filter (all, open, or closed)',
  inputs: {
    type: 'object',
    properties: {
      filter: {
        type: 'string',
        enum: ['all', 'open', 'closed'],
        description: 'Filter to apply to pull requests',
      },
    },
    required: ['filter'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      filter: { type: 'string' },
    },
  },
  tags: ['git', 'pull-requests', 'filter'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'git-panels.pull-requests:set-filter',
  },
};

/**
 * All pull requests panel tools
 */
export const pullRequestsTools: PanelTool[] = [
  refreshPullRequestsTool,
  setPRFilterTool,
];

/**
 * Pull requests panel tools metadata
 */
export const pullRequestsToolsMetadata: PanelToolsMetadata = {
  id: 'git-panels.pull-requests',
  name: 'Git Pull Requests',
  description: 'Tools for the git pull requests panel',
  tools: pullRequestsTools,
};

// ============================================================================
// Pull Request Detail Panel Tools
// ============================================================================

/**
 * Tool: Select Pull Request
 */
export const selectPullRequestTool: PanelTool = {
  name: 'select_pull_request',
  description: 'Selects a pull request to display in the detail panel',
  inputs: {
    type: 'object',
    properties: {
      pr: {
        type: 'object',
        description: 'The pull request object to display',
      },
    },
    required: ['pr'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
    },
  },
  tags: ['git', 'pull-requests', 'detail', 'select'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'git-panels.pull-request:selected',
  },
};

/**
 * Tool: Deselect Pull Request
 */
export const deselectPullRequestTool: PanelTool = {
  name: 'deselect_pull_request',
  description: 'Clears the current pull request selection',
  inputs: {
    type: 'object',
    properties: {},
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
    },
  },
  tags: ['git', 'pull-requests', 'detail', 'deselect'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'git-panels.pull-request:deselected',
  },
};

/**
 * All pull request detail panel tools
 */
export const pullRequestDetailTools: PanelTool[] = [
  selectPullRequestTool,
  deselectPullRequestTool,
];

/**
 * Pull request detail panel tools metadata
 */
export const pullRequestDetailToolsMetadata: PanelToolsMetadata = {
  id: 'git-panels.pull-request-detail',
  name: 'Pull Request Details',
  description: 'Tools for the pull request detail panel',
  tools: pullRequestDetailTools,
};

// ============================================================================
// Combined Exports
// ============================================================================

/**
 * All tools from this extension
 */
export const allGitPanelTools: PanelTool[] = [
  ...commitHistoryTools,
  ...pullRequestsTools,
  ...pullRequestDetailTools,
];
