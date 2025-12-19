import type { Meta, StoryObj } from '@storybook/react';
import { GitConfigPanel, GitConfigPanelPreview } from './GitConfigPanel';
import { MockPanelProvider, createMockContext } from '../mocks/panelContext';
import type { DataSlice } from '../types';
import type { GitConfigSliceData } from '../types';

const meta: Meta<typeof GitConfigPanel> = {
  title: 'Git Panels/Git Configuration',
  component: GitConfigPanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GitConfigPanel>;

/**
 * Default state with mock git config data
 */
export const Default: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <GitConfigPanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Empty remotes and branches
 */
export const MinimalConfig: Story = {
  render: () => (
    <MockPanelProvider
      contextOverrides={{
        ...createMockContext(),
        getSlice: <T,>(name: string): DataSlice<T> | undefined => {
          if (name === 'gitConfig') {
            const data: GitConfigSliceData = {
              user: {
                name: 'Developer',
                email: 'dev@example.com',
              },
              core: {},
              performance: {},
              transfer: {},
              mergeDiff: {},
              commit: {},
              remotes: [],
              branches: [],
              allEntries: [
                { key: 'user.name', value: 'Developer', scope: 'global' },
                { key: 'user.email', value: 'dev@example.com', scope: 'global' },
              ],
            };
            return {
              scope: 'repository',
              name: 'gitConfig',
              data: data as unknown as T,
              loading: false,
              error: null,
              refresh: async () => {},
            };
          }
          return undefined;
        },
        hasSlice: (name: string) => name === 'gitConfig',
        isSliceLoading: () => false,
      }}
    >
      {(props) => <GitConfigPanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Multiple remotes configured
 */
export const MultipleRemotes: Story = {
  render: () => (
    <MockPanelProvider
      contextOverrides={{
        ...createMockContext(),
        getSlice: <T,>(name: string): DataSlice<T> | undefined => {
          if (name === 'gitConfig') {
            const data: GitConfigSliceData = {
              user: {
                name: 'Alex Developer',
                email: 'alex@example.com',
              },
              core: {
                editor: 'code --wait',
                fsmonitor: true,
                untrackedCache: true,
              },
              performance: {
                gcAuto: 256,
                featureManyFiles: true,
              },
              transfer: {
                fetchPrune: true,
                pullRebase: true,
                pushAutoSetupRemote: true,
              },
              mergeDiff: {
                diffAlgorithm: 'histogram',
                rerereEnabled: true,
              },
              commit: {
                gpgSign: false,
              },
              remotes: [
                {
                  name: 'origin',
                  fetchUrl: 'git@github.com:myorg/myrepo.git',
                },
                {
                  name: 'upstream',
                  fetchUrl: 'git@github.com:upstream/myrepo.git',
                },
                {
                  name: 'fork',
                  fetchUrl: 'https://github.com/myfork/myrepo.git',
                  pushUrl: 'git@github.com:myfork/myrepo.git',
                },
              ],
              branches: [
                { name: 'main', remote: 'origin', merge: 'refs/heads/main' },
                { name: 'develop', remote: 'origin', merge: 'refs/heads/develop' },
                { name: 'feature/config-panel', remote: 'origin', merge: 'refs/heads/feature/config-panel' },
              ],
              allEntries: [
                { key: 'user.name', value: 'Alex Developer', scope: 'global' },
                { key: 'user.email', value: 'alex@example.com', scope: 'global' },
                { key: 'core.editor', value: 'code --wait', scope: 'global' },
                { key: 'core.fsmonitor', value: 'true', scope: 'local' },
                { key: 'remote.origin.url', value: 'git@github.com:myorg/myrepo.git', scope: 'local' },
                { key: 'remote.upstream.url', value: 'git@github.com:upstream/myrepo.git', scope: 'local' },
                { key: 'remote.fork.url', value: 'https://github.com/myfork/myrepo.git', scope: 'local' },
                { key: 'branch.main.remote', value: 'origin', scope: 'local' },
                { key: 'branch.main.merge', value: 'refs/heads/main', scope: 'local' },
              ],
            };
            return {
              scope: 'repository',
              name: 'gitConfig',
              data: data as unknown as T,
              loading: false,
              error: null,
              refresh: async () => {},
            };
          }
          return undefined;
        },
        hasSlice: (name: string) => name === 'gitConfig',
        isSliceLoading: () => false,
      }}
    >
      {(props) => <GitConfigPanel {...props} />}
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
          if (name === 'gitConfig') {
            return {
              scope: 'repository',
              name: 'gitConfig',
              data: undefined as unknown as T,
              loading: true,
              error: null,
              refresh: async () => {},
            };
          }
          return undefined;
        },
        hasSlice: (name: string) => name === 'gitConfig',
        isSliceLoading: (name: string) => name === 'gitConfig',
      }}
    >
      {(props) => <GitConfigPanel {...props} />}
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
      {(props) => <GitConfigPanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * No config slice available
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
      {(props) => <GitConfigPanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Preview component for panel configuration UI
 */
export const Preview: Story = {
  render: () => (
    <MockPanelProvider>
      {() => <GitConfigPanelPreview />}
    </MockPanelProvider>
  ),
};
