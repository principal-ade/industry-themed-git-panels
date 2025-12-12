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
