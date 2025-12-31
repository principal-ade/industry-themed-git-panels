import React, { useEffect, useState } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { DocumentView } from 'themed-markdown';
import {
  ExternalLink,
  GitCommit,
  Loader2,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import type { PanelComponentProps, GitCommitDetail } from '../types';
import { formatRelativeTime } from '../utils/formatters';

/**
 * GitCommitDetailPanel - Displays detailed information about a selected commit.
 *
 * This panel listens for commit detail events from the host and displays:
 * - Commit hash and short hash
 * - Full commit message (with markdown rendering)
 * - Author information
 * - Date
 * - Stats (additions/deletions)
 *
 * Events:
 * - Listens: 'git-panels.commit-detail:loaded' - When host provides full commit data
 * - Listens: 'git-panels.commit-detail:loading' - When host is fetching commit data
 * - Listens: 'git-panels.commit-detail:error' - When fetch fails
 * - Emits: 'git-panels.commit:deselected' - When close button is clicked
 */

interface CommitDetailLoadedPayload {
  commit: GitCommitDetail;
}

interface CommitDetailLoadingPayload {
  hash: string;
}

interface CommitDetailErrorPayload {
  hash: string;
  error: string;
}

const GitCommitDetailPanelContent: React.FC<PanelComponentProps> = ({
  events,
}) => {
  const { theme } = useTheme();
  const [selectedCommit, setSelectedCommit] = useState<GitCommitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to commit detail events from host
  useEffect(() => {
    if (!events) return;

    const unsubscribers = [
      // Host is loading commit details
      events.on<CommitDetailLoadingPayload>(
        'git-panels.commit-detail:loading',
        (event) => {
          setIsLoading(true);
          setError(null);
        }
      ),
      // Host loaded commit details
      events.on<CommitDetailLoadedPayload>(
        'git-panels.commit-detail:loaded',
        (event) => {
          const commit = event.payload?.commit;
          if (commit) {
            setSelectedCommit(commit);
            setIsLoading(false);
            setError(null);
          }
        }
      ),
      // Host encountered error
      events.on<CommitDetailErrorPayload>(
        'git-panels.commit-detail:error',
        (event) => {
          setError(event.payload?.error || 'Failed to load commit');
          setIsLoading(false);
        }
      ),
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub && unsub());
    };
  }, [events]);

  const handleClose = () => {
    setSelectedCommit(null);
    setError(null);
    if (events) {
      events.emit({
        type: 'git-panels.commit:deselected',
        source: 'git-panels.commit-detail',
        timestamp: Date.now(),
        payload: {},
      });
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <Loader2
            size={32}
            style={{
              color: theme.colors.primary,
              animation: 'spin 1s linear infinite',
            }}
          />
          <p
            style={{
              margin: 0,
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes[1],
              color: theme.colors.textSecondary,
            }}
          >
            Loading commit details...
          </p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <X size={48} style={{ color: theme.colors.error || '#ef4444' }} />
          <div>
            <h3
              style={{
                margin: 0,
                marginBottom: '8px',
                fontFamily: theme.fonts.heading,
                fontSize: theme.fontSizes[3],
                fontWeight: 600,
                color: theme.colors.text,
              }}
            >
              Failed to Load Commit
            </h3>
            <p
              style={{
                margin: 0,
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes[1],
                color: theme.colors.textSecondary,
              }}
            >
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state - no commit selected
  if (!selectedCommit) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <GitCommit size={48} style={{ color: theme.colors.textMuted }} />
          <div>
            <h3
              style={{
                margin: 0,
                marginBottom: '8px',
                fontFamily: theme.fonts.heading,
                fontSize: theme.fontSizes[3],
                fontWeight: 600,
                color: theme.colors.text,
              }}
            >
              No Commit Selected
            </h3>
            <p
              style={{
                margin: 0,
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes[1],
                color: theme.colors.textSecondary,
                lineHeight: 1.5,
              }}
            >
              Click on a commit in the history to view its details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const shortHash = selectedCommit.hash.substring(0, 8);
  const [firstLine, ...restLines] = selectedCommit.message.split('\n');
  const messageBody = restLines.join('\n').trim();
  const relative = formatRelativeTime(selectedCommit.date);

  return (
    <div style={containerStyle}>
      {/* Header - 40px to match other panels */}
      <div
        style={{
          height: '40px',
          minHeight: '40px',
          padding: '0 12px',
          borderBottom: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.backgroundSecondary,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxSizing: 'border-box',
        }}
      >
        {/* Files changed count */}
        {selectedCommit.files && selectedCommit.files.length > 0 && (
          <span
            style={{
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes[0],
              fontFamily: theme.fonts.body,
            }}
          >
            <span style={{ color: theme.colors.primary }}>{selectedCommit.files.length} {selectedCommit.files.length === 1 ? 'file' : 'files'}</span> changed
          </span>
        )}

        {/* Author, date, and hash info */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes[0],
            fontFamily: theme.fonts.body,
          }}
        >
          <span style={{ color: theme.colors.primary }}>{relative}</span>
          <span>by <span style={{ color: theme.colors.primary }}>{selectedCommit.author}</span></span>
          <span>as</span>
          <span style={{ fontFamily: theme.fonts.monospace }}>sha {shortHash}</span>
        </span>

        {/* Stats badge */}
        {selectedCommit.stats && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: `${theme.colors.primary}20`,
              color: theme.colors.primary,
              fontFamily: theme.fonts.heading,
              fontSize: theme.fontSizes[0],
              fontWeight: 600,
            }}
          >
            <span style={{ color: theme.colors.success || '#22c55e', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <Plus size={12} />
              {selectedCommit.stats.additions}
            </span>
            <span style={{ color: theme.colors.error || '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              <Minus size={12} />
              {selectedCommit.stats.deletions}
            </span>
          </span>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* External link */}
        {selectedCommit.htmlUrl && (
          <a
            href={selectedCommit.htmlUrl}
            target="_blank"
            rel="noreferrer"
            title="View on GitHub"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              padding: 0,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              backgroundColor: theme.colors.background,
              color: theme.colors.textSecondary,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} />
          </a>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          title="Close"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            padding: 0,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            backgroundColor: theme.colors.background,
            color: theme.colors.textSecondary,
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Content area - scrollable */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
        }}
      >
        {/* Title (first line of commit message) */}
        <h1
          style={{
            margin: 0,
            marginBottom: '16px',
            fontFamily: theme.fonts.heading,
            fontSize: theme.fontSizes[4] || 20,
            fontWeight: 600,
            color: theme.colors.text,
            lineHeight: 1.3,
          }}
        >
          {firstLine}
        </h1>

        {/* Body - markdown rendered (if there's more than just the first line) */}
        {messageBody && (
          <div
            style={{
              borderTop: `1px solid ${theme.colors.border}`,
              paddingTop: '16px',
            }}
          >
            <DocumentView
              content={messageBody}
              theme={theme}
              maxWidth="100%"
              transparentBackground
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Main panel component
 */
export const GitCommitDetailPanel = GitCommitDetailPanelContent;

/**
 * Preview component for panel configuration UI
 */
export const GitCommitDetailPanelPreview: React.FC = () => {
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
        <GitCommit size={12} style={{ color: theme.colors.primary }} />
        <span
          style={{
            fontFamily: theme.fonts.monospace,
            fontSize: theme.fontSizes[0],
            color: theme.colors.primary,
          }}
        >
          a1b2c3d4
        </span>
        <span style={{ color: theme.colors.success || '#22c55e', fontSize: '10px' }}>+42</span>
        <span style={{ color: theme.colors.error || '#ef4444', fontSize: '10px' }}>-15</span>
      </div>
      <div style={{ fontFamily: theme.fonts.heading, fontWeight: 600 }}>
        feat: add commit detail panel
      </div>
      <div
        style={{
          color: theme.colors.textSecondary,
          fontSize: theme.fontSizes[0],
          lineHeight: 1.4,
        }}
      >
        View commit message, stats, and files changed.
      </div>
    </div>
  );
};
