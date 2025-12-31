import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { GitCommitDetailPanel, GitCommitDetailPanelPreview } from './GitCommitDetailPanel';
import { MockPanelProvider } from '../mocks/panelContext';
import type { GitCommitDetail, PanelComponentProps } from '../types';

const meta: Meta<typeof GitCommitDetailPanel> = {
  title: 'Git Panels/Commit Detail',
  component: GitCommitDetailPanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GitCommitDetailPanel>;

// Sample commit with rich message and files
const sampleFeatureCommit: GitCommitDetail = {
  hash: 'a1b2c3d4e5f6789012345678901234567890abcd',
  message: `feat: add dark mode toggle to settings panel

This commit introduces a dark mode toggle that allows users to switch
between light and dark themes.

## Changes
- Added ThemeContext for managing theme state
- Created DarkModeToggle component
- Updated CSS variables for dark theme support

## Testing
Verified in Chrome, Firefox, and Safari.`,
  author: 'Alex Developer',
  authorEmail: 'alex@example.com',
  date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  htmlUrl: 'https://github.com/example/repo/commit/a1b2c3d4e5f6789012345678901234567890abcd',
  stats: {
    additions: 142,
    deletions: 23,
    total: 165,
  },
  files: [
    { filename: 'src/contexts/ThemeContext.tsx', status: 'added', additions: 45, deletions: 0, changes: 45 },
    { filename: 'src/components/DarkModeToggle.tsx', status: 'added', additions: 62, deletions: 0, changes: 62 },
    { filename: 'src/styles/variables.css', status: 'modified', additions: 35, deletions: 23, changes: 58 },
  ],
};

const sampleBugfixCommit: GitCommitDetail = {
  hash: 'b2c3d4e5f6789012345678901234567890abcdef',
  message: `fix: resolve memory leak in event handler

The useEffect cleanup function was not removing the event listener,
causing memory leaks on component unmount.`,
  author: 'Jordan Smith',
  authorEmail: 'jordan@example.com',
  date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  htmlUrl: 'https://github.com/example/repo/commit/b2c3d4e5f6789012345678901234567890abcdef',
  stats: {
    additions: 3,
    deletions: 1,
    total: 4,
  },
  files: [
    { filename: 'src/hooks/useWindowResize.ts', status: 'modified', additions: 3, deletions: 1, changes: 4 },
  ],
};

const sampleRefactorCommit: GitCommitDetail = {
  hash: 'c3d4e5f6789012345678901234567890abcdef12',
  message: `refactor: extract authentication logic to separate service

Moved all authentication-related code from individual components
into a centralized AuthService for better maintainability.`,
  author: 'Taylor Chen',
  authorEmail: 'taylor@example.com',
  date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  stats: {
    additions: 234,
    deletions: 189,
    total: 423,
  },
  files: [
    { filename: 'src/services/AuthService.ts', status: 'added', additions: 156, deletions: 0, changes: 156 },
    { filename: 'src/components/LoginForm.tsx', status: 'modified', additions: 12, deletions: 45, changes: 57 },
    { filename: 'src/components/SignupForm.tsx', status: 'modified', additions: 8, deletions: 38, changes: 46 },
    { filename: 'src/utils/auth.ts', status: 'removed', additions: 0, deletions: 89, changes: 89 },
    { filename: 'src/hooks/useAuth.ts', status: 'modified', additions: 58, deletions: 17, changes: 75 },
  ],
};

const sampleSimpleCommit: GitCommitDetail = {
  hash: 'd4e5f6789012345678901234567890abcdef1234',
  message: 'chore: update dependencies',
  author: 'dependabot[bot]',
  date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  stats: {
    additions: 45,
    deletions: 45,
    total: 90,
  },
  files: [
    { filename: 'package.json', status: 'modified', additions: 5, deletions: 5, changes: 10 },
    { filename: 'package-lock.json', status: 'modified', additions: 40, deletions: 40, changes: 80 },
  ],
};

const sampleRenameCommit: GitCommitDetail = {
  hash: 'e5f6789012345678901234567890abcdef123456',
  message: `refactor: rename utils to helpers for clarity

Renamed the utils directory to helpers to better reflect the purpose
of the contained modules.`,
  author: 'Morgan Lee',
  authorEmail: 'morgan@example.com',
  date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  htmlUrl: 'https://github.com/example/repo/commit/e5f6789012345678901234567890abcdef123456',
  stats: {
    additions: 0,
    deletions: 0,
    total: 0,
  },
  files: [
    { filename: 'src/helpers/formatters.ts', status: 'renamed', additions: 0, deletions: 0, changes: 0, previous_filename: 'src/utils/formatters.ts' },
    { filename: 'src/helpers/validators.ts', status: 'renamed', additions: 0, deletions: 0, changes: 0, previous_filename: 'src/utils/validators.ts' },
  ],
};

/**
 * Wrapper that emits a commit loaded event on mount
 */
const WithLoadedCommit: React.FC<{
  commit: GitCommitDetail;
  children: (props: PanelComponentProps) => React.ReactNode;
}> = ({ commit, children }) => {
  return (
    <MockPanelProvider>
      {(props) => {
        useEffect(() => {
          props.events.emit({
            type: 'git-panels.commit-detail:loaded',
            source: 'storybook',
            timestamp: Date.now(),
            payload: { commit },
          });
        }, []);

        return children(props);
      }}
    </MockPanelProvider>
  );
};

/**
 * Wrapper that emits a loading event on mount
 */
const WithLoadingState: React.FC<{
  hash: string;
  children: (props: PanelComponentProps) => React.ReactNode;
}> = ({ hash, children }) => {
  return (
    <MockPanelProvider>
      {(props) => {
        useEffect(() => {
          props.events.emit({
            type: 'git-panels.commit-detail:loading',
            source: 'storybook',
            timestamp: Date.now(),
            payload: { hash },
          });
        }, []);

        return children(props);
      }}
    </MockPanelProvider>
  );
};

/**
 * Wrapper that emits an error event on mount
 */
const WithErrorState: React.FC<{
  hash: string;
  error: string;
  children: (props: PanelComponentProps) => React.ReactNode;
}> = ({ hash, error, children }) => {
  return (
    <MockPanelProvider>
      {(props) => {
        useEffect(() => {
          props.events.emit({
            type: 'git-panels.commit-detail:error',
            source: 'storybook',
            timestamp: Date.now(),
            payload: { hash, error },
          });
        }, []);

        return children(props);
      }}
    </MockPanelProvider>
  );
};

/**
 * Empty state - no commit selected
 */
export const EmptyState: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <GitCommitDetailPanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Loading state - waiting for commit data
 */
export const Loading: Story = {
  render: () => (
    <WithLoadingState hash="a1b2c3d4">
      {(props) => <GitCommitDetailPanel {...props} />}
    </WithLoadingState>
  ),
};

/**
 * Error state - failed to load commit
 */
export const Error: Story = {
  render: () => (
    <WithErrorState hash="a1b2c3d4" error="Commit not found in repository">
      {(props) => <GitCommitDetailPanel {...props} />}
    </WithErrorState>
  ),
};

/**
 * Feature commit with rich markdown body and multiple files
 */
export const FeatureCommit: Story = {
  render: () => (
    <WithLoadedCommit commit={sampleFeatureCommit}>
      {(props) => <GitCommitDetailPanel {...props} />}
    </WithLoadedCommit>
  ),
};

/**
 * Bug fix commit with minimal changes
 */
export const BugfixCommit: Story = {
  render: () => (
    <WithLoadedCommit commit={sampleBugfixCommit}>
      {(props) => <GitCommitDetailPanel {...props} />}
    </WithLoadedCommit>
  ),
};

/**
 * Refactor commit with many file changes
 */
export const RefactorCommit: Story = {
  render: () => (
    <WithLoadedCommit commit={sampleRefactorCommit}>
      {(props) => <GitCommitDetailPanel {...props} />}
    </WithLoadedCommit>
  ),
};

/**
 * Simple commit with single-line message
 */
export const SimpleCommit: Story = {
  render: () => (
    <WithLoadedCommit commit={sampleSimpleCommit}>
      {(props) => <GitCommitDetailPanel {...props} />}
    </WithLoadedCommit>
  ),
};

/**
 * Commit with renamed files
 */
export const RenameCommit: Story = {
  render: () => (
    <WithLoadedCommit commit={sampleRenameCommit}>
      {(props) => <GitCommitDetailPanel {...props} />}
    </WithLoadedCommit>
  ),
};

/**
 * Preview component for panel configuration UI
 */
export const Preview: Story = {
  render: () => (
    <MockPanelProvider>
      {() => <GitCommitDetailPanelPreview />}
    </MockPanelProvider>
  ),
};
