import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import {
  AlertCircle,
  GitPullRequest,
  Loader2,
  MessageSquare,
  RefreshCcw,
} from 'lucide-react';
import type { PanelComponentProps } from '../types';
import type { PullRequestsSliceData, PullRequestInfo } from '../types';
import { formatDate } from '../utils/formatters';

/**
 * GitPullRequestsPanel - Displays open pull requests from the 'pullRequests' slice.
 *
 * This panel expects the host to provide PR data through:
 * - context.getSlice<PullRequestsSliceData>('pullRequests')
 *
 * The panel supports:
 * - Refresh via context.refresh()
 * - Tool events for programmatic interaction
 */
export const GitPullRequestsPanel: React.FC<PanelComponentProps> = ({
  context,
  events,
}) => {
  const { theme } = useTheme();
  const [selectedPrId, setSelectedPrId] = useState<number | null>(null);
  const [showDrafts, setShowDrafts] = useState(false);

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
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [events, context]);

  // Filter to only open pull requests, optionally excluding drafts
  const filteredPullRequests = useMemo(() => {
    return pullRequests.filter((pr) => {
      if (pr.state !== 'open') return false;
      if (!showDrafts && pr.draft) return false;
      return true;
    });
  }, [pullRequests, showDrafts]);

  // Count drafts for the toggle label
  const draftCount = useMemo(() => {
    return pullRequests.filter((pr) => pr.state === 'open' && pr.draft).length;
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
    setSelectedPrId(pr.id);
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
          position: 'relative',
          height: '40px',
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.backgroundLight,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
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
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes[1],
                color: theme.colors.textSecondary,
                fontWeight: 500,
              }}
            >
              Open Pull Requests
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {draftCount > 0 && (
              <button
                type="button"
                onClick={() => setShowDrafts(!showDrafts)}
                style={{
                  background: showDrafts
                    ? theme.colors.backgroundSecondary
                    : 'none',
                  border: `1px solid ${showDrafts ? theme.colors.border : 'transparent'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  color: showDrafts
                    ? theme.colors.primary
                    : theme.colors.textSecondary,
                  fontSize: theme.fontSizes[0],
                  fontFamily: theme.fonts.body,
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
                title={showDrafts ? 'Hide draft PRs' : 'Show draft PRs'}
              >
                Drafts
              </button>
            )}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              style={{
                background: 'none',
                border: '1px solid transparent',
                borderRadius: '4px',
                cursor: isLoading ? 'default' : 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.textSecondary,
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s ease',
              }}
              title={isLoading ? 'Refreshing...' : 'Refresh'}
            >
              {isLoading ? (
                <Loader2 size={16} className="spin" />
              ) : (
                <RefreshCcw size={16} />
              )}
            </button>
          </div>
        </div>
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
            <div style={{ fontFamily: theme.fonts.heading, fontSize: theme.fontSizes[1], fontWeight: 600 }}>No open pull requests</div>
            <div style={{ marginTop: '4px', fontSize: theme.fontSizes[0] }}>
              {draftCount > 0 && !showDrafts
                ? `There are ${draftCount} draft PR${draftCount === 1 ? '' : 's'} hidden.`
                : 'There are no open pull requests to display.'}
            </div>
          </div>
        ) : (
          filteredPullRequests.map((pr) => (
            <PullRequestCard key={pr.id} pr={pr} theme={theme} isSelected={selectedPrId === pr.id} onClick={() => handlePRClick(pr)} />
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
  isSelected?: boolean;
  onClick?: () => void;
}> = ({ pr, theme, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = isHovered || isSelected;
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: '16px 16px',
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
          color: theme.colors.text,
          lineHeight: 1.3,
          wordBreak: 'break-word',
          transition: 'color 0.15s ease',
        }}
      >
        {pr.title}
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
        <span
          style={{
            fontFamily: theme.fonts.heading,
            fontWeight: 600,
            color: theme.colors.textSecondary,
          }}
        >
          #{pr.number}
        </span>
        <span>by <span style={{ color: theme.colors.primary }}>{pr.user?.login ?? 'unknown'}</span></span>
        <span>{formatDate(pr.created_at)}</span>
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
