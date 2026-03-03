import type { Meta, StoryObj } from '@storybook/react';
import { GitCommitHistoryPanel, GitCommitHistoryPanelPreview } from './GitCommitHistoryPanel';
import { MockPanelProvider, createMockContext } from '../mocks/panelContext';
import type { GitCommitHistoryPanelProps } from '../types';

const meta: Meta<typeof GitCommitHistoryPanel> = {
  title: 'Git Panels/Commit History',
  component: GitCommitHistoryPanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GitCommitHistoryPanel>;

/**
 * Default state with mock commit data
 */
export const Default: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <GitCommitHistoryPanel {...props as GitCommitHistoryPanelProps} />}
    </MockPanelProvider>
  ),
};

/**
 * Empty state when no commits are found
 */
export const Empty: Story = {
  render: () => (
    <MockPanelProvider
      contextOverrides={{
        ...createMockContext(),
        commits: {
          scope: 'repository',
          name: 'commits',
          data: { commits: [] },
          loading: false,
          error: null,
          refresh: async () => {},
        },
      }}
    >
      {(props) => <GitCommitHistoryPanel {...props as GitCommitHistoryPanelProps} />}
    </MockPanelProvider>
  ),
};

/**
 * Loading state
 */
export const Loading: Story = {
  render: () => (
    <MockPanelProvider
      contextOverrides={{
        ...createMockContext(),
        commits: {
          scope: 'repository',
          name: 'commits',
          data: { commits: [] },
          loading: true,
          error: null,
          refresh: async () => {},
        },
      }}
    >
      {(props) => <GitCommitHistoryPanel {...props as GitCommitHistoryPanelProps} />}
    </MockPanelProvider>
  ),
};

/**
 * No repository connected
 */
export const NoRepository: Story = {
  render: () => (
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
      {(props) => <GitCommitHistoryPanel {...props as GitCommitHistoryPanelProps} />}
    </MockPanelProvider>
  ),
};

/**
 * No commits slice available
 */
export const NoSlice: Story = {
  render: () => (
    <MockPanelProvider
      contextOverrides={{
        ...createMockContext(),
        commits: undefined,
      }}
    >
      {(props) => <GitCommitHistoryPanel {...props as GitCommitHistoryPanelProps} />}
    </MockPanelProvider>
  ),
};

/**
 * Preview component for panel configuration UI
 */
export const Preview: Story = {
  render: () => (
    <MockPanelProvider>
      {() => <GitCommitHistoryPanelPreview />}
    </MockPanelProvider>
  ),
};
