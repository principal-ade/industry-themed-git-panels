import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import {
  AlertCircle,
  Calendar,
  GitPullRequest,
  Loader2,
  MessageSquare,
  RefreshCcw,
} from 'lucide-react';
import type { PanelComponentProps } from '../types';
import type { PullRequestsSliceData, PullRequestInfo } from '../types';
import { formatDate } from '../utils/formatters';

type FilterState = 'open' | 'closed';

/**
 * GitPullRequestsPanel - Displays pull requests from the 'pullRequests' slice.
 *
 * This panel expects the host to provide PR data through:
 * - context.getSlice<PullRequestsSliceData>('pullRequests')
 *
 * The panel supports:
 * - Filtering by state (all, open, closed)
 * - Refresh via context.refresh()
 * - Tool events for programmatic interaction
 */
export const GitPullRequestsPanel: React.FC<PanelComponentProps> = ({
  context,
  events,
}) => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<FilterState>('open');

  // Get pull requests from the slice
  const prSlice = context.getSlice<PullRequestsSliceData>('pullRequests');
  const hasPRs = context.hasSlice('pullRequests');
  const isLoading = context.isSliceLoading('pullRequests');
  const pullRequests = prSlice?.data?.pullRequests ?? [];

  // Subscribe to panel events
  useEffect(() => {
    const unsubscribers = [
      // Tool: refresh pull requests
      events.on<{ force?: boolean }>('git-panels.pull-requests:refresh', async () => {
        try {
          await context.refresh('repository', 'pullRequests');
        } catch (error) {
          console.error('[GitPullRequestsPanel] Refresh failed:', error);
        }
      }),

      // Tool: set filter
      events.on<{ filter: FilterState }>('git-panels.pull-requests:set-filter', (event) => {
        const newFilter = event.payload?.filter;
        if (newFilter && ['open', 'closed'].includes(newFilter)) {
          setFilter(newFilter);
        }
      }),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [events, context]);

  // Filter pull requests
  const filteredPullRequests = useMemo(() => {
    return pullRequests.filter((pr) => pr.state === filter);
  }, [filter, pullRequests]);

  // Count PRs by state
  const counts = useMemo(() => {
    const open = pullRequests.filter((pr) => pr.state === 'open').length;
    const closed = pullRequests.filter((pr) => pr.state === 'closed').length;
    return { open, closed };
  }, [pullRequests]);

  const handleRefresh = async () => {
    try {
      await context.refresh('repository', 'pullRequests');
    } catch (error) {
      console.error('[GitPullRequestsPanel] Refresh failed:', error);
    }
  };

  // Emit selection event when PR card is clicked
  const handlePRClick = (pr: PullRequestInfo) => {
    events.emit({
      type: 'git-panels.pull-request:selected',
      source: 'git-panels.pull-requests',
      timestamp: Date.now(),
      payload: { pr },
    });
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  };

  // Render a centered state message
  const renderState = (
    icon: React.ReactNode,
    title: string,
    description?: string,
  ) => (
    <div style={containerStyle}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '360px',
            textAlign: 'center',
          }}
        >
          <div>{icon}</div>
          <div>
            <h3
              style={{
                margin: 0,
                marginBottom: '8px',
                color: theme.colors.text,
                fontFamily: theme.fonts.heading,
                fontSize: theme.fontSizes[2],
                fontWeight: 600,
              }}
            >
              {title}
            </h3>
            {description && (
              <p
                style={{
                  margin: 0,
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fonts.body,
                  fontSize: theme.fontSizes[1],
                  lineHeight: 1.5,
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading && pullRequests.length === 0) {
    return renderState(
      <Loader2 size={32} style={{ color: theme.colors.textSecondary }} className="spin" />,
      'Loading pull requests...',
      'Fetching pull request data for this repository.',
    );
  }

  // No repository
  if (!context.currentScope.repository) {
    return renderState(
      <AlertCircle size={32} style={{ color: theme.colors.textSecondary }} />,
      'No repository selected',
      'Select a repository to view pull requests.',
    );
  }

  // No PR slice available
  if (!hasPRs) {
    return renderState(
      <AlertCircle size={32} style={{ color: theme.colors.warning || '#f59e0b' }} />,
      'Pull requests unavailable',
      'Pull request data is not available for this repository.',
    );
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
          <GitPullRequest size={14} />
          Pull Requests
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
          {isLoading ? (
            <Loader2 size={12} className="spin" />
          ) : (
            <RefreshCcw size={12} />
          )}
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filter buttons - equal width */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        {(['open', 'closed'] as const).map((value) => {
          const isActive = filter === value;
          const label = value === 'open' ? 'Open' : 'Closed';

          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px 12px',
                border: 'none',
                borderBottom: isActive ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
                backgroundColor: 'transparent',
                color: isActive ? theme.colors.text : theme.colors.textSecondary,
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes[1],
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                marginBottom: '-1px',
              }}
            >
              {label}
              <span style={{ opacity: 0.7 }}>({counts[value]})</span>
            </button>
          );
        })}
      </div>

      {/* PR List */}
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
        {filteredPullRequests.length === 0 ? (
          <div
            style={{
              marginTop: '48px',
              textAlign: 'center',
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.body,
            }}
          >
            <GitPullRequest size={32} style={{ marginBottom: '12px' }} />
            <div style={{ fontFamily: theme.fonts.heading, fontSize: theme.fontSizes[1], fontWeight: 600 }}>No pull requests found</div>
            <div style={{ marginTop: '4px', fontSize: theme.fontSizes[0] }}>
              There are no {filter} pull requests to display.
            </div>
          </div>
        ) : (
          filteredPullRequests.map((pr) => (
            <PullRequestCard key={pr.id} pr={pr} theme={theme} onClick={() => handlePRClick(pr)} />
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Individual pull request card component
 */
const PullRequestCard: React.FC<{
  pr: PullRequestInfo;
  theme: ReturnType<typeof useTheme>['theme'];
  onClick?: () => void;
}> = ({ pr, theme, onClick }) => {
  const isMerged = pr.merged_at !== null;
  const isOpen = pr.state === 'open';

  const totalComments = (pr.comments || 0) + (pr.review_comments || 0);

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
      style={{
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: '12px 16px',
        backgroundColor: theme.colors.backgroundSecondary,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        cursor: onClick ? 'pointer' : 'default',
        minWidth: 0,
      }}
    >
      {/* Title row: PR number + title */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: theme.fontSizes[1],
            fontWeight: 600,
            color: theme.colors.textSecondary,
            flexShrink: 0,
          }}
        >
          #{pr.number}
        </span>
        <span
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: theme.fontSizes[2],
            fontWeight: 600,
            color: theme.colors.text,
            lineHeight: 1.3,
            wordBreak: 'break-word',
          }}
        >
          {pr.title}
        </span>
      </div>

      {/* Metadata row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px 12px',
          flexWrap: 'wrap',
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.body,
          fontSize: theme.fontSizes[0],
        }}
      >
        {pr.draft && (
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: theme.colors.background,
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.heading,
              fontSize: theme.fontSizes[0],
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            Draft
          </span>
        )}
        <span>by {pr.user?.login ?? 'unknown'}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Calendar size={12} /> {formatDate(pr.created_at)}
        </span>
        {!isOpen && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isMerged ? 'Merged' : 'Closed'} {formatDate(pr.merged_at || pr.updated_at)}
          </span>
        )}
        {totalComments > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <MessageSquare size={12} /> {totalComments}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Preview component for panel configuration UI
 */
export const GitPullRequestsPanelPreview: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      style={{
        padding: '12px',
        fontFamily: theme.fonts.body,
        fontSize: theme.fontSizes[0],
        color: theme.colors.text,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: '#3b82f622',
            color: '#3b82f6',
            fontFamily: theme.fonts.heading,
            fontSize: theme.fontSizes[0],
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          Review
        </span>
        <span style={{ fontFamily: theme.fonts.heading, fontWeight: 600 }}>#42 Refine panel layout system</span>
      </div>
      <div
        style={{
          paddingLeft: '4px',
          color: theme.colors.textSecondary,
          fontSize: theme.fontSizes[0],
          lineHeight: 1.4,
        }}
      >
        Adds preview registry and consolidates configurator metadata.
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: theme.colors.textSecondary,
          fontSize: theme.fontSizes[0],
        }}
      >
        <span>4 checks</span>
        <span>•</span>
        <span>1 reviewer</span>
      </div>
    </div>
  );
};
