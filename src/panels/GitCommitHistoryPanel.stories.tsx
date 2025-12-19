import type { Meta, StoryObj } from '@storybook/react';
import { GitCommitHistoryPanel, GitCommitHistoryPanelPreview } from './GitCommitHistoryPanel';
import { MockPanelProvider, createMockContext } from '../mocks/panelContext';
import type { DataSlice } from '../types';
import type { CommitsSliceData } from '../types';

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
      {(props) => <GitCommitHistoryPanel {...props} />}
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
        getSlice: <T,>(name: string): DataSlice<T> | undefined => {
          if (name === 'commits') {
            return {
              scope: 'repository',
              name: 'commits',
              data: { commits: [] } as unknown as T,
              loading: false,
              error: null,
              refresh: async () => {},
            };
          }
          return undefined;
        },
        hasSlice: (name: string) => name === 'commits',
        isSliceLoading: () => false,
      }}
    >
      {(props) => <GitCommitHistoryPanel {...props} />}
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
        getSlice: <T,>(name: string): DataSlice<T> | undefined => {
          if (name === 'commits') {
            return {
              scope: 'repository',
              name: 'commits',
              data: { commits: [] } as unknown as T,
              loading: true,
              error: null,
              refresh: async () => {},
            };
          }
          return undefined;
        },
        hasSlice: (name: string) => name === 'commits',
        isSliceLoading: (name: string) => name === 'commits',
      }}
    >
      {(props) => <GitCommitHistoryPanel {...props} />}
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
      {(props) => <GitCommitHistoryPanel {...props} />}
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
        hasSlice: () => false,
        getSlice: () => undefined,
      }}
    >
      {(props) => <GitCommitHistoryPanel {...props} />}
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
