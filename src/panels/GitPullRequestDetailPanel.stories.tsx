import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { GitPullRequestDetailPanel, GitPullRequestDetailPanelPreview } from './GitPullRequestDetailPanel';
import { MockPanelProvider } from '../mocks/panelContext';
import type { PullRequestInfo, PanelComponentProps } from '../types';

const meta: Meta<typeof GitPullRequestDetailPanel> = {
  title: 'Git Panels/Pull Request Detail',
  component: GitPullRequestDetailPanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GitPullRequestDetailPanel>;

// Sample PR with rich markdown body
const sampleOpenPR: PullRequestInfo = {
  id: 1001,
  number: 42,
  title: 'feat: implement dark mode toggle',
  body: `## Summary

This PR adds a dark mode toggle to the settings panel.

### Changes
- Added \`ThemeContext\` for managing theme state
- Created \`DarkModeToggle\` component
- Updated CSS variables for dark theme support

### Testing
- [x] Unit tests pass
- [x] Manual testing in Chrome, Firefox, Safari
- [ ] Accessibility audit

\`\`\`typescript
const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
});
\`\`\`

### Screenshots
Dark mode enabled:
> The UI now respects system preferences and allows manual override.
`,
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
};

const sampleDraftPR: PullRequestInfo = {
  id: 1003,
  number: 44,
  title: 'WIP: refactor authentication module',
  body: `## Work in Progress

This is an early draft for refactoring the authentication module.

### TODO
- [ ] Extract token management to separate service
- [ ] Add refresh token support
- [ ] Update tests
- [ ] Documentation

> **Note:** Not ready for review yet.
`,
  state: 'open',
  draft: true,
  html_url: 'https://github.com/example/repo/pull/44',
  user: { login: 'taylor-dev' },
  created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date().toISOString(),
  base: { ref: 'main' },
  head: { ref: 'refactor/auth' },
  comments: 0,
  review_comments: 0,
};

const sampleMergedPR: PullRequestInfo = {
  id: 1002,
  number: 41,
  title: 'fix: resolve memory leak in event handler',
  body: `## Bug Fix

Fixed a memory leak caused by not cleaning up event listeners on unmount.

### Root Cause
The \`useEffect\` cleanup function was not removing the event listener:

\`\`\`diff
- useEffect(() => {
-   window.addEventListener('resize', handleResize);
- }, []);
+ useEffect(() => {
+   window.addEventListener('resize', handleResize);
+   return () => window.removeEventListener('resize', handleResize);
+ }, []);
\`\`\`

### Testing
Verified with Chrome DevTools Memory tab - no more detached DOM nodes.
`,
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
  comments: 5,
  review_comments: 8,
};

const sampleNoBodyPR: PullRequestInfo = {
  id: 1004,
  number: 45,
  title: 'chore: update dependencies',
  body: null,
  state: 'open',
  draft: false,
  html_url: 'https://github.com/example/repo/pull/45',
  user: { login: 'dependabot[bot]' },
  created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  base: { ref: 'main' },
  head: { ref: 'dependabot/npm_and_yarn/lodash-4.17.21' },
  comments: 0,
  review_comments: 0,
};

/**
 * Wrapper that emits a PR selection event on mount
 */
const WithSelectedPR: React.FC<{
  pr: PullRequestInfo;
  children: (props: PanelComponentProps) => React.ReactNode;
}> = ({ pr, children }) => {
  return (
    <MockPanelProvider>
      {(props) => {
        // Emit selection event after initial render
        useEffect(() => {
          props.events.emit({
            type: 'git-panels.pull-request:selected',
            source: 'storybook',
            timestamp: Date.now(),
            payload: { pr },
          });
        }, []);

        return children(props);
      }}
    </MockPanelProvider>
  );
};

/**
 * Empty state - no PR selected
 */
export const EmptyState: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <GitPullRequestDetailPanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Open PR with rich markdown body
 */
export const OpenPR: Story = {
  render: () => (
    <WithSelectedPR pr={sampleOpenPR}>
      {(props) => <GitPullRequestDetailPanel {...props} />}
    </WithSelectedPR>
  ),
};

/**
 * Draft PR
 */
export const DraftPR: Story = {
  render: () => (
    <WithSelectedPR pr={sampleDraftPR}>
      {(props) => <GitPullRequestDetailPanel {...props} />}
    </WithSelectedPR>
  ),
};

/**
 * Merged PR
 */
export const MergedPR: Story = {
  render: () => (
    <WithSelectedPR pr={sampleMergedPR}>
      {(props) => <GitPullRequestDetailPanel {...props} />}
    </WithSelectedPR>
  ),
};

/**
 * PR with no body/description
 */
export const NoBody: Story = {
  render: () => (
    <WithSelectedPR pr={sampleNoBodyPR}>
      {(props) => <GitPullRequestDetailPanel {...props} />}
    </WithSelectedPR>
  ),
};

/**
 * Preview component for panel configuration UI
 */
export const Preview: Story = {
  render: () => (
    <MockPanelProvider>
      {() => <GitPullRequestDetailPanelPreview />}
    </MockPanelProvider>
  ),
};
