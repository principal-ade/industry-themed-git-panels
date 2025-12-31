import React, { useEffect, useMemo, useState } from 'react';
import { History as HistoryIcon, RefreshCcw } from 'lucide-react';
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
  const [selectedHash, setSelectedHash] = useState<string | null>(null);

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

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  };

  // Render a centered state message
  const renderState = (message: string) => (
    <div style={containerStyle}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          color: theme.colors.textSecondary,
        }}
      >
        {message}
      </div>
    </div>
  );

  // No repository connected
  if (!context.currentScope.repository) {
    return renderState('Connect a local repository to see commit history.');
  }

  // No commits slice available
  if (!hasCommits) {
    return renderState('Commit history data is not available.');
  }

  return (
    <div style={containerStyle}>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      {/* Header - 40px total including border */}
      <div
        style={{
          height: '40px',
          minHeight: '40px',
          padding: '0 12px',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.heading,
            fontSize: theme.fontSizes[0],
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
Commit History
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '4px',
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            cursor: isLoading ? 'default' : 'pointer',
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes[0],
            fontWeight: 500,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          <RefreshCcw size={12} />
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="hide-scrollbar"
      >
        {/* Loading state */}
        {isLoading && commits.length === 0 && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
              marginTop: '48px',
              textAlign: 'center',
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.body,
            }}
          >
            <HistoryIcon size={32} style={{ marginBottom: '12px' }} />
            <div style={{ fontFamily: theme.fonts.heading, fontSize: theme.fontSizes[1], fontWeight: 600 }}>No commits found</div>
            <div style={{ marginTop: '4px', fontSize: theme.fontSizes[0] }}>
              There are no commits to display.
            </div>
          </div>
        )}

        {/* Commit list */}
        {sortedCommits.map((commit) => (
          <CommitCard
            key={commit.hash}
            commit={commit}
            theme={theme}
            isSelected={selectedHash === commit.hash}
            onClick={() => {
              setSelectedHash(commit.hash);
              // Emit selection event with hash - host will fetch full details
              events.emit({
                type: 'git-panels.commit:selected',
                source: 'git-panels.commit-history',
                timestamp: Date.now(),
                payload: { hash: commit.hash },
              });
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Individual commit card component
 */
const CommitCard: React.FC<{
  commit: GitCommitInfo;
  theme: ReturnType<typeof useTheme>['theme'];
  isSelected?: boolean;
  onClick?: () => void;
}> = ({ commit, theme, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = isHovered || isSelected;
  const firstLine = commit.message.split('\n')[0];
  const relative = formatRelativeTime(commit.date);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: '16px',
        backgroundColor: isActive ? theme.colors.backgroundSecondary : theme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        cursor: onClick ? 'pointer' : 'default',
        minWidth: 0,
        transition: 'background-color 0.15s ease',
      }}
    >
      {/* Title row */}
      <div
        style={{
          fontFamily: theme.fonts.heading,
          fontSize: theme.fontSizes[2],
          fontWeight: 600,
          color: isActive ? theme.colors.text : theme.colors.primary,
          lineHeight: 1.3,
          wordBreak: 'break-word',
          transition: 'color 0.15s ease',
        }}
      >
        {firstLine}
      </div>

      {/* Metadata row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSizes[0],
        }}
      >
        <span title={new Date(commit.date).toLocaleString()}>{relative}</span>
        {commit.author && <span>by {commit.author}</span>}
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
