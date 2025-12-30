/**
 * Panel Extension Type Definitions
 *
 * Re-exports core types from @principal-ade/panel-framework-core
 * and defines git-specific slice types for this library.
 */

// Re-export all core types from panel-framework-core
export type {
  // Core data types
  DataSlice,
  WorkspaceMetadata,
  RepositoryMetadata,
  FileTreeSource,
  ActiveFileSlice,

  // Event system
  PanelEventType,
  PanelEvent,
  PanelEventEmitter,

  // Panel interface
  PanelActions,
  PanelContextValue,
  PanelComponentProps,

  // Panel definition
  PanelMetadata,
  PanelLifecycleHooks,
  PanelDefinition,
  PanelModule,

  // Registry types
  PanelRegistryEntry,
  PanelLoader,
  PanelRegistryConfig,

  // Tool types (UTCP-compatible)
  PanelTool,
  PanelToolsMetadata,
  JsonSchema,
  PanelEventCallTemplate,
} from '@principal-ade/panel-framework-core';

// ============================================================================
// Git Commit History Types
// ============================================================================

/**
 * Information about a single git commit.
 * Host should provide this data via the 'commits' slice.
 */
export interface GitCommitInfo {
  /** Full commit hash */
  hash: string;
  /** Commit message (may be multiline) */
  message: string;
  /** Author name */
  author: string;
  /** Author email */
  authorEmail?: string;
  /** ISO date string of when the commit was made */
  date: string;
}

/**
 * Data structure for the 'commits' slice.
 */
export interface CommitsSliceData {
  commits: GitCommitInfo[];
}

// ============================================================================
// Pull Request Types
// ============================================================================

/**
 * User information for PR author/assignee.
 */
export interface PullRequestUser {
  login: string;
  avatar_url?: string;
  html_url?: string;
}

/**
 * Branch reference information.
 */
export interface PullRequestRef {
  ref: string;
  sha?: string;
}

/**
 * Information about a single pull request.
 * Host should provide this data via the 'pullRequests' slice.
 */
export interface PullRequestInfo {
  /** Unique identifier */
  id: number;
  /** PR number (e.g., #42) */
  number: number;
  /** PR title */
  title: string;
  /** PR body/description */
  body?: string | null;
  /** State: 'open' or 'closed' */
  state: 'open' | 'closed';
  /** Whether this is a draft PR */
  draft?: boolean;
  /** URL to view the PR */
  html_url: string;
  /** PR author */
  user?: PullRequestUser | null;
  /** ISO date string when PR was created */
  created_at: string;
  /** ISO date string when PR was last updated */
  updated_at: string;
  /** ISO date string when PR was closed (null if open) */
  closed_at?: string | null;
  /** ISO date string when PR was merged (null if not merged) */
  merged_at?: string | null;
  /** Base branch (target) */
  base?: PullRequestRef | null;
  /** Head branch (source) */
  head?: PullRequestRef | null;
  /** Number of comments */
  comments?: number;
  /** Number of review comments */
  review_comments?: number;
  /** Number of files changed */
  changed_files?: number;
  /** Number of lines added */
  additions?: number;
  /** Number of lines deleted */
  deletions?: number;
}

/**
 * Data structure for the 'pullRequests' slice.
 */
export interface PullRequestsSliceData {
  pullRequests: PullRequestInfo[];
  /** Repository owner (e.g., 'anthropics') */
  owner?: string;
  /** Repository name (e.g., 'claude-code') */
  repo?: string;
}

// ============================================================================
// Git Configuration Types
// ============================================================================

/**
 * A single git configuration entry.
 */
export interface GitConfigEntry {
  /** Configuration key (e.g., 'user.name', 'core.editor') */
  key: string;
  /** Configuration value */
  value: string;
  /** Scope where this config is defined */
  scope: 'local' | 'global' | 'system';
}

/**
 * Git remote configuration.
 */
export interface GitRemoteInfo {
  /** Remote name (e.g., 'origin', 'upstream') */
  name: string;
  /** Fetch URL */
  fetchUrl: string;
  /** Push URL (may differ from fetch) */
  pushUrl?: string;
}

/**
 * Git branch configuration.
 */
export interface GitBranchConfig {
  /** Branch name */
  name: string;
  /** Remote tracking branch */
  remote?: string;
  /** Merge reference */
  merge?: string;
}

/**
 * Data structure for the 'gitConfig' slice.
 */
export interface GitConfigSliceData {
  /** User configuration (name, email, etc.) */
  user: {
    name?: string;
    email?: string;
    signingKey?: string;
  };
  /** Core git settings */
  core: {
    editor?: string;
    autocrlf?: string;
    ignorecase?: boolean;
    filemode?: boolean;
    fsmonitor?: boolean | string;
    untrackedCache?: boolean | string;
    preloadIndex?: boolean;
    fscache?: boolean;
    symlinks?: boolean;
    longpaths?: boolean;
  };
  /** Performance & optimization settings */
  performance: {
    /** Maintenance/gc settings */
    gcAuto?: number | string;
    gcAutoPackLimit?: number | string;
    /** Pack settings */
    packThreads?: number | string;
    packWindowMemory?: string;
    /** Feature flags */
    featureManyFiles?: boolean;
    featureExperimental?: boolean;
  };
  /** Fetch/pull/push settings */
  transfer: {
    fetchPrune?: boolean;
    fetchPruneTag?: boolean;
    pullRebase?: boolean | string;
    pullFf?: string;
    pushDefault?: string;
    pushAutoSetupRemote?: boolean;
    pushFollowTags?: boolean;
  };
  /** Merge and diff settings */
  mergeDiff: {
    mergeFf?: string;
    mergeConflictStyle?: string;
    diffAlgorithm?: string;
    diffColorMoved?: string;
    rerereEnabled?: boolean;
  };
  /** Commit settings */
  commit: {
    gpgSign?: boolean;
    template?: string;
    verbose?: boolean;
  };
  /** Configured remotes */
  remotes: GitRemoteInfo[];
  /** Branch configurations */
  branches: GitBranchConfig[];
  /** All raw config entries for detailed view */
  allEntries: GitConfigEntry[];
}
