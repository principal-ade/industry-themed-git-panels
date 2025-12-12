import type { Meta, StoryObj } from '@storybook/react';
import { GitPullRequestsPanel, GitPullRequestsPanelPreview } from './GitPullRequestsPanel';
import { MockPanelProvider, createMockContext } from '../mocks/panelContext';
import type { DataSlice } from '../types';
import type { PullRequestsSliceData } from '../types';

const meta: Meta<typeof GitPullRequestsPanel> = {
  title: 'Git Panels/Pull Requests',
  component: GitPullRequestsPanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GitPullRequestsPanel>;

/**
 * Default state with mock PR data
 */
export const Default: Story = {
  render: () => (
    <div style={{ height: '600px' }}>
      <MockPanelProvider>
        {(props) => <GitPullRequestsPanel {...props} />}
      </MockPanelProvider>
    </div>
  ),
};

/**
 * Empty state when no PRs are found
 */
export const Empty: Story = {
  render: () => (
    <div style={{ height: '400px' }}>
      <MockPanelProvider
        contextOverrides={{
          ...createMockContext(),
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            if (name === 'pullRequests') {
              return {
                scope: 'repository',
                name: 'pullRequests',
                data: { pullRequests: [], owner: 'example', repo: 'repo' } as unknown as T,
                loading: false,
                error: null,
                refresh: async () => {},
              };
            }
            return undefined;
          },
          hasSlice: (name: string) => name === 'pullRequests',
          isSliceLoading: () => false,
        }}
      >
        {(props) => <GitPullRequestsPanel {...props} />}
      </MockPanelProvider>
    </div>
  ),
};

/**
 * Loading state
 */
export const Loading: Story = {
  render: () => (
    <div style={{ height: '400px' }}>
      <MockPanelProvider
        contextOverrides={{
          ...createMockContext(),
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            if (name === 'pullRequests') {
              return {
                scope: 'repository',
                name: 'pullRequests',
                data: { pullRequests: [] } as unknown as T,
                loading: true,
                error: null,
                refresh: async () => {},
              };
            }
            return undefined;
          },
          hasSlice: (name: string) => name === 'pullRequests',
          isSliceLoading: (name: string) => name === 'pullRequests',
        }}
      >
        {(props) => <GitPullRequestsPanel {...props} />}
      </MockPanelProvider>
    </div>
  ),
};

/**
 * No repository connected
 */
export const NoRepository: Story = {
  render: () => (
    <div style={{ height: '400px' }}>
      <MockPanelProvider
        contextOverrides={{
          ...createMockContext(),
          currentScope: {
            type: 'workspace',
            workspace: { name: 'my-workspace', path: '/path/to/workspace' },
            repository: undefined,
          },
        }}
      >
        {(props) => <GitPullRequestsPanel {...props} />}
      </MockPanelProvider>
    </div>
  ),
};

/**
 * No pull requests slice available
 */
export const NoSlice: Story = {
  render: () => (
    <div style={{ height: '400px' }}>
      <MockPanelProvider
        contextOverrides={{
          ...createMockContext(),
          hasSlice: () => false,
          getSlice: () => undefined,
        }}
      >
        {(props) => <GitPullRequestsPanel {...props} />}
      </MockPanelProvider>
    </div>
  ),
};

/**
 * Only open PRs
 */
export const OnlyOpenPRs: Story = {
  render: () => (
    <div style={{ height: '500px' }}>
      <MockPanelProvider
        contextOverrides={{
          ...createMockContext(),
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            if (name === 'pullRequests') {
              const data: PullRequestsSliceData = {
                pullRequests: [
                  {
                    id: 1001,
                    number: 42,
                    title: 'feat: implement dark mode toggle',
                    body: 'This PR adds a dark mode toggle.',
                    state: 'open',
                    draft: false,
                    html_url: 'https://github.com/example/repo/pull/42',
                    user: { login: 'alex-dev' },
                    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date().toISOString(),
                    base: { ref: 'main' },
                    head: { ref: 'feature/dark-mode' },
                    comments: 3,
                    review_comments: 2,
                  },
                  {
                    id: 1002,
                    number: 43,
                    title: 'fix: resolve memory leak',
                    body: 'Fixed memory leak.',
                    state: 'open',
                    draft: true,
                    html_url: 'https://github.com/example/repo/pull/43',
                    user: { login: 'jordan-smith' },
                    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date().toISOString(),
                    base: { ref: 'main' },
                    head: { ref: 'fix/memory-leak' },
                    comments: 0,
                    review_comments: 0,
                  },
                ],
                owner: 'example',
                repo: 'repo',
              };
              return {
                scope: 'repository',
                name: 'pullRequests',
                data: data as unknown as T,
                loading: false,
                error: null,
                refresh: async () => {},
              };
            }
            return undefined;
          },
          hasSlice: (name: string) => name === 'pullRequests',
          isSliceLoading: () => false,
        }}
      >
        {(props) => <GitPullRequestsPanel {...props} />}
      </MockPanelProvider>
    </div>
  ),
};

/**
 * Preview component for panel configuration UI
 */
export const Preview: Story = {
  render: () => (
    <MockPanelProvider>
      {() => <GitPullRequestsPanelPreview />}
    </MockPanelProvider>
  ),
};
