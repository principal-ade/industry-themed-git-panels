import React, { useEffect, useMemo, useState } from 'react';
import { History as HistoryIcon, RefreshCcw, Clock } from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import type { PanelComponentProps } from '../types';
import type { CommitsSliceData, GitCommitInfo } from '../types';
import { formatRelativeTime } from '../utils/formatters';

/**
 * GitCommitHistoryPanel - Displays git commit history from the 'commits' slice.
 *
 * This panel expects the host to provide commit data through:
 * - context.getSlice<CommitsSliceData>('commits')
 *
 * The panel supports:
 * - Displaying commits sorted by date (newest first)
 * - Refresh via context.refresh()
 * - Tool events for programmatic interaction
 */
export const GitCommitHistoryPanel: React.FC<PanelComponentProps> = ({
  context,
  events,
}) => {
  const { theme } = useTheme();
  const [limit, setLimit] = useState(25);

  // Get commits from the slice
  const commitsSlice = context.getSlice<CommitsSliceData>('commits');
  const hasCommits = context.hasSlice('commits');
  const isLoading = context.isSliceLoading('commits');
  const commits = commitsSlice?.data?.commits ?? [];

  // Sort commits by date (newest first)
  const sortedCommits = useMemo(() => {
    return commits.slice(0, limit).sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return timeB - timeA;
    });
  }, [commits, limit]);

  // Subscribe to panel events
  useEffect(() => {
    const unsubscribers = [
      // Tool: refresh commits
      events.on<{ force?: boolean }>('git-panels.commit-history:refresh', async (event) => {
        try {
          await context.refresh('repository', 'commits');
        } catch (error) {
          console.error('[GitCommitHistoryPanel] Refresh failed:', error);
        }
      }),

      // Tool: set limit
      events.on<{ limit: number }>('git-panels.commit-history:set-limit', (event) => {
        const newLimit = event.payload?.limit;
        if (newLimit && newLimit > 0) {
          setLimit(newLimit);
        }
      }),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [events, context]);

  const handleRefresh = async () => {
    try {
      await context.refresh('repository', 'commits');
    } catch (error) {
      console.error('[GitCommitHistoryPanel] Refresh failed:', error);
    }
  };

  // No repository connected
  if (!context.currentScope.repository) {
    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: '8px',
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.textSecondary,
        }}
      >
        Connect a local repository to see commit history.
      </div>
    );
  }

  // No commits slice available
  if (!hasCommits) {
    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: '8px',
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.textSecondary,
        }}
      >
        Commit history data is not available.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: theme.colors.backgroundSecondary,
        borderRadius: '8px',
        border: `1px solid ${theme.colors.border}`,
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: theme.colors.textSecondary,
          textTransform: 'uppercase',
          fontWeight: 600,
          fontSize: theme.fontSizes[1],
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HistoryIcon size={14} />
          Commit History
        </span>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '6px',
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            cursor: isLoading ? 'default' : 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          <RefreshCcw size={12} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && commits.length === 0 && (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes[1],
          }}
        >
          Loading commit history...
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sortedCommits.length === 0 && (
        <div
          style={{
            padding: '12px',
            textAlign: 'center',
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes[1],
            backgroundColor: theme.colors.background,
            borderRadius: '6px',
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          No commits found.
        </div>
      )}

      {/* Commit list */}
      {sortedCommits.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {sortedCommits.map((commit) => (
            <CommitCard key={commit.hash} commit={commit} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Individual commit card component
 */
const CommitCard: React.FC<{
  commit: GitCommitInfo;
  theme: ReturnType<typeof useTheme>['theme'];
}> = ({ commit, theme }) => {
  const firstLine = commit.message.split('\n')[0];
  const relative = formatRelativeTime(commit.date);

  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: theme.colors.background,
        borderRadius: '6px',
        border: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div
        style={{
          fontSize: theme.fontSizes[2],
          color: theme.colors.text,
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {firstLine}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          fontSize: theme.fontSizes[1],
          color: theme.colors.textSecondary,
        }}
      >
        {commit.author && <span>{commit.author}</span>}
        <span style={{ fontSize: '10px' }}>•</span>
        <span
          style={{
            fontFamily: theme.fonts.monospace,
            fontSize: '11px',
          }}
        >
          {commit.hash.substring(0, 8)}
        </span>
        <span style={{ fontSize: '10px' }}>•</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Clock size={12} />
          <span title={new Date(commit.date).toLocaleString()}>{relative}</span>
        </span>
      </div>
    </div>
  );
};

/**
 * Preview component for panel configuration UI
 */
export const GitCommitHistoryPanelPreview: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        padding: '12px',
        fontSize: '12px',
        color: theme.colors.text,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {[
        {
          title: 'chore: add commit history panel',
          author: 'Alex Engineer',
          sha: '1a2b3c4d',
          time: '2 hours ago',
        },
        {
          title: 'fix: handle empty repositories gracefully',
          author: 'Jamie Dev',
          sha: '5f6g7h8i',
          time: 'Yesterday',
        },
      ].map((commit) => (
        <div
          key={commit.sha}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            padding: '8px',
            backgroundColor: theme.colors.background,
          }}
        >
          <span style={{ fontWeight: 600 }}>{commit.title}</span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: theme.colors.textSecondary,
              fontSize: '11px',
              fontFamily: theme.fonts.body,
            }}
          >
            <span>{commit.author}</span>
            <span>•</span>
            <span style={{ fontFamily: theme.fonts.monospace }}>
              {commit.sha}
            </span>
            <span>•</span>
            <span>{commit.time}</span>
          </span>
        </div>
      ))}
    </div>
  );
};
