import React from 'react';
import { ThemeProvider } from '@principal-ade/industry-theme';
import type {
  PanelComponentProps,
  PanelContextValue,
  PanelActions,
  PanelEventEmitter,
  PanelEvent,
  PanelEventType,
  DataSlice,
} from '../types';

import type { CommitsSliceData, PullRequestsSliceData } from '../types';

/**
 * Mock Git Status data for Storybook
 */
const mockGitStatusData = {
  staged: ['src/components/Button.tsx', 'src/styles/theme.css'],
  unstaged: ['README.md', 'package.json'],
  untracked: ['src/new-feature.tsx'],
  deleted: [],
};

/**
 * Mock Commits data for Storybook
 */
const mockCommitsData: CommitsSliceData = {
  commits: [
    {
      hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
      message: 'feat: add new git commit history panel\n\nThis panel displays recent commits from the repository.',
      author: 'Alex Developer',
      authorEmail: 'alex@example.com',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      hash: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
      message: 'fix: handle empty repository state gracefully',
      author: 'Jordan Smith',
      authorEmail: 'jordan@example.com',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    },
    {
      hash: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2',
      message: 'refactor: extract commit card component',
      author: 'Alex Developer',
      authorEmail: 'alex@example.com',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
      hash: 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3',
      message: 'docs: update README with installation instructions',
      author: 'Taylor Doc',
      authorEmail: 'taylor@example.com',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    },
  ],
};

/**
 * Mock Pull Requests data for Storybook
 */
const mockPullRequestsData: PullRequestsSliceData = {
  pullRequests: [
    {
      id: 1001,
      number: 42,
      title: 'feat: implement dark mode toggle',
      body: 'This PR adds a dark mode toggle to the settings panel. It includes theme switching logic and persists the preference to local storage.',
      state: 'open',
      draft: false,
      html_url: 'https://github.com/example/repo/pull/42',
      user: { login: 'alex-dev', avatar_url: 'https://github.com/alex-dev.png' },
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      base: { ref: 'main' },
      head: { ref: 'feature/dark-mode' },
      comments: 3,
      review_comments: 2,
    },
    {
      id: 1002,
      number: 41,
      title: 'fix: resolve memory leak in event handler',
      body: 'Fixed a memory leak caused by not cleaning up event listeners on unmount.',
      state: 'closed',
      draft: false,
      html_url: 'https://github.com/example/repo/pull/41',
      user: { login: 'jordan-smith' },
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      closed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      merged_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      base: { ref: 'main' },
      head: { ref: 'fix/memory-leak' },
      comments: 1,
      review_comments: 4,
    },
    {
      id: 1003,
      number: 40,
      title: 'WIP: experimental API refactor',
      body: 'Early work on refactoring the API layer. Not ready for review yet.',
      state: 'open',
      draft: true,
      html_url: 'https://github.com/example/repo/pull/40',
      user: { login: 'taylor-engineer' },
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      base: { ref: 'main' },
      head: { ref: 'refactor/api' },
      comments: 0,
      review_comments: 0,
    },
    {
      id: 1004,
      number: 39,
      title: 'chore: update dependencies',
      body: 'Routine dependency updates for security patches.',
      state: 'closed',
      draft: false,
      html_url: 'https://github.com/example/repo/pull/39',
      user: { login: 'dependabot[bot]' },
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      closed_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      base: { ref: 'main' },
      head: { ref: 'dependabot/npm' },
      comments: 0,
      review_comments: 0,
    },
  ],
  owner: 'example',
  repo: 'repo',
};

/**
 * Create a mock DataSlice
 */
const createMockSlice = <T,>(
  name: string,
  data: T,
  scope: 'workspace' | 'repository' | 'global' = 'repository'
): DataSlice<T> => ({
  scope,
  name,
  data,
  loading: false,
  error: null,
  refresh: async () => {
    // eslint-disable-next-line no-console
    console.log(`[Mock] Refreshing slice: ${name}`);
  },
});

/**
 * Mock Panel Context for Storybook
 */
export const createMockContext = (
  overrides?: Partial<PanelContextValue>
): PanelContextValue => {
  // Create mock data slices
  const mockSlices = new Map<string, DataSlice>([
    ['git', createMockSlice('git', mockGitStatusData)],
    ['commits', createMockSlice('commits', mockCommitsData)],
    ['pullRequests', createMockSlice('pullRequests', mockPullRequestsData)],
    [
      'markdown',
      createMockSlice('markdown', [
        {
          path: 'README.md',
          title: 'Project README',
          lastModified: Date.now() - 3600000,
        },
        {
          path: 'docs/API.md',
          title: 'API Documentation',
          lastModified: Date.now() - 86400000,
        },
      ]),
    ],
    [
      'fileTree',
      createMockSlice('fileTree', {
        name: 'my-project',
        path: '/Users/developer/my-project',
        type: 'directory',
        children: [
          {
            name: 'src',
            path: '/Users/developer/my-project/src',
            type: 'directory',
          },
          {
            name: 'package.json',
            path: '/Users/developer/my-project/package.json',
            type: 'file',
          },
        ],
      }),
    ],
    [
      'packages',
      createMockSlice('packages', [
        { name: 'react', version: '19.0.0', path: '/node_modules/react' },
        {
          name: 'typescript',
          version: '5.0.4',
          path: '/node_modules/typescript',
        },
      ]),
    ],
    [
      'quality',
      createMockSlice('quality', {
        coverage: 85,
        issues: 3,
        complexity: 12,
      }),
    ],
  ]);

  const defaultContext: PanelContextValue = {
    currentScope: {
      type: 'repository',
      workspace: {
        name: 'my-workspace',
        path: '/Users/developer/my-workspace',
      },
      repository: {
        name: 'my-project',
        path: '/Users/developer/my-project',
      },
    },
    slices: mockSlices,
    getSlice: <T,>(name: string): DataSlice<T> | undefined => {
      return mockSlices.get(name) as DataSlice<T> | undefined;
    },
    getWorkspaceSlice: <T,>(name: string): DataSlice<T> | undefined => {
      const slice = mockSlices.get(name);
      return slice?.scope === 'workspace'
        ? (slice as DataSlice<T>)
        : undefined;
    },
    getRepositorySlice: <T,>(name: string): DataSlice<T> | undefined => {
      const slice = mockSlices.get(name);
      return slice?.scope === 'repository'
        ? (slice as DataSlice<T>)
        : undefined;
    },
    hasSlice: (name: string, scope?: 'workspace' | 'repository'): boolean => {
      const slice = mockSlices.get(name);
      if (!slice) return false;
      if (!scope) return true;
      return slice.scope === scope;
    },
    isSliceLoading: (
      name: string,
      scope?: 'workspace' | 'repository'
    ): boolean => {
      const slice = mockSlices.get(name);
      if (!slice) return false;
      if (scope && slice.scope !== scope) return false;
      return slice.loading;
    },
    refresh: async (
      scope?: 'workspace' | 'repository',
      slice?: string
    ): Promise<void> => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Context refresh called', { scope, slice });
    },
  };

  return { ...defaultContext, ...overrides };
};

/**
 * Mock Panel Actions for Storybook
 */
export const createMockActions = (
  overrides?: Partial<PanelActions>
): PanelActions => ({
  openFile: (filePath: string) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Opening file:', filePath);
  },
  openGitDiff: (filePath: string, status) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Opening git diff:', filePath, status);
  },
  navigateToPanel: (panelId: string) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Navigating to panel:', panelId);
  },
  notifyPanels: (event) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Notifying panels:', event);
  },
  ...overrides,
});

/**
 * Mock Event Emitter for Storybook
 */
export const createMockEvents = (): PanelEventEmitter => {
  const handlers = new Map<
    PanelEventType,
    Set<(event: PanelEvent<unknown>) => void>
  >();

  return {
    emit: (event) => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Emitting event:', event);
      const eventHandlers = handlers.get(event.type);
      if (eventHandlers) {
        eventHandlers.forEach((handler) => handler(event));
      }
    },
    on: (type, handler) => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Subscribing to event:', type);
      if (!handlers.has(type)) {
        handlers.set(type, new Set());
      }
      handlers.get(type)!.add(handler as (event: PanelEvent<unknown>) => void);

      // Return cleanup function
      return () => {
        // eslint-disable-next-line no-console
        console.log('[Mock] Unsubscribing from event:', type);
        handlers
          .get(type)
          ?.delete(handler as (event: PanelEvent<unknown>) => void);
      };
    },
    off: (type, handler) => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Removing event handler:', type);
      handlers
        .get(type)
        ?.delete(handler as (event: PanelEvent<unknown>) => void);
    },
  };
};

/**
 * Mock Panel Props Provider
 * Wraps components with mock context and ThemeProvider for Storybook
 */
export const MockPanelProvider: React.FC<{
  children: (props: PanelComponentProps) => React.ReactNode;
  contextOverrides?: Partial<PanelContextValue>;
  actionsOverrides?: Partial<PanelActions>;
}> = ({ children, contextOverrides, actionsOverrides }) => {
  const context = createMockContext(contextOverrides);
  const actions = createMockActions(actionsOverrides);
  const events = createMockEvents();

  return <ThemeProvider>{children({ context, actions, events })}</ThemeProvider>;
};
