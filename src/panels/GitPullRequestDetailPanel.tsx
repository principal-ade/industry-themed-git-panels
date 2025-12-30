import React, { useEffect, useState } from 'react';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import { DocumentView } from 'themed-markdown';
import {
  ExternalLink,
  FileText,
  GitBranch,
  GitMerge,
  GitPullRequest,
  MessageSquare,
  X,
} from 'lucide-react';
import type { PanelComponentProps, PullRequestInfo } from '../types';
import { formatDate } from '../utils/formatters';

/**
 * GitPullRequestDetailPanel - Displays detailed information about a selected PR.
 *
 * This panel listens for PR selection events and displays:
 * - PR header with status and number
 * - Title
 * - Metadata (author, branches, dates, comments)
 * - Body rendered as markdown via DocumentView
 *
 * Events:
 * - Listens: 'git-panels.pull-request:selected' - When a PR is selected
 * - Emits: 'git-panels.pull-request:deselected' - When back button is clicked
 */

interface PRSelectedPayload {
  pr: PullRequestInfo;
}

const GitPullRequestDetailPanelContent: React.FC<PanelComponentProps> = ({
  events,
}) => {
  const { theme } = useTheme();
  const [selectedPR, setSelectedPR] = useState<PullRequestInfo | null>(null);

  // Subscribe to PR selection events
  useEffect(() => {
    if (!events) return;

    const unsubscribe = events.on<PRSelectedPayload>(
      'git-panels.pull-request:selected',
      (event) => {
        const pr = event.payload?.pr;
        if (pr) {
          setSelectedPR(pr);
        }
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [events]);

  const handleBack = () => {
    setSelectedPR(null);
    if (events) {
      events.emit({
        type: 'git-panels.pull-request:deselected',
        source: 'git-panels.pull-request-detail',
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

  // Empty state - no PR selected
  if (!selectedPR) {
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
          <FileText size={48} style={{ color: theme.colors.textMuted }} />
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
              No Pull Request Selected
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
              Click on a pull request in the list to view its details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isMerged = selectedPR.merged_at !== null;
  const isOpen = selectedPR.state === 'open';

  const statusColor = isOpen
    ? theme.colors.success || '#22c55e'
    : isMerged
      ? theme.colors.primary
      : theme.colors.error || '#ef4444';
  const statusBg = `${statusColor}20`;
  const statusLabel = isOpen ? 'Open' : isMerged ? 'Merged' : 'Closed';

  const totalComments = (selectedPR.comments || 0) + (selectedPR.review_comments || 0);

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
          gap: '12px',
          boxSizing: 'border-box',
        }}
      >
        {/* PR number */}
        <span
          style={{
            fontFamily: theme.fonts.monospace,
            fontSize: theme.fontSizes[0],
            color: theme.colors.textSecondary,
          }}
        >
          #{selectedPR.number}
        </span>

        {/* Status badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: statusBg,
            color: statusColor,
            fontFamily: theme.fonts.heading,
            fontSize: theme.fontSizes[0],
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {isMerged ? <GitMerge size={12} /> : <GitPullRequest size={12} />}
          {statusLabel}
          {selectedPR.draft && (
            <span
              style={{
                marginLeft: '4px',
                padding: '2px 6px',
                borderRadius: '6px',
                backgroundColor: theme.colors.backgroundSecondary,
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes[0],
                fontWeight: 500,
                textTransform: 'capitalize',
              }}
            >
              Draft
            </span>
          )}
        </span>

        {/* Branch info */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.monospace,
            fontSize: theme.fontSizes[0],
          }}
        >
          <GitBranch size={14} />
          {selectedPR.base?.ref ?? '?'} ← {selectedPR.head?.ref ?? '?'}
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* External link */}
        <a
          href={selectedPR.html_url}
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

        {/* Close button */}
        <button
          type="button"
          onClick={handleBack}
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
        {/* Title */}
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
          {selectedPR.title}
        </h1>

        {/* Metadata grid */}
        {(totalComments > 0 || !isOpen) && (
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: theme.colors.backgroundSecondary,
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            {/* Comments */}
            {totalComments > 0 && (
              <MetadataRow
                icon={<MessageSquare size={14} />}
                label="Comments"
                value={String(totalComments)}
                theme={theme}
              />
            )}

            {/* Merged/Closed date */}
            {!isOpen && (
              <MetadataRow
                icon={isMerged ? <GitMerge size={14} /> : <GitPullRequest size={14} />}
                label={isMerged ? 'Merged' : 'Closed'}
                value={formatDate(selectedPR.merged_at || selectedPR.closed_at || selectedPR.updated_at)}
                theme={theme}
              />
            )}
          </div>
        )}

        {/* Body - markdown rendered */}
        <div
          style={{
            borderTop: `1px solid ${theme.colors.border}`,
            paddingTop: '16px',
          }}
        >
          {selectedPR.body ? (
            <DocumentView
              content={selectedPR.body}
              theme={theme}
              maxWidth="100%"
              transparentBackground
            />
          ) : (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: theme.colors.textMuted,
                fontFamily: theme.fonts.body,
                fontSize: theme.fontSizes[1],
                fontStyle: 'italic',
              }}
            >
              No description provided.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Metadata row component for displaying label/value pairs with icons
 */
const MetadataRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  theme: ReturnType<typeof useTheme>['theme'];
}> = ({ icon, label, value, mono, theme }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSizes[0],
    }}
  >
    <span style={{ color: theme.colors.textMuted }}>{icon}</span>
    <span style={{ color: theme.colors.textSecondary }}>{label}:</span>
    <span
      style={{
        color: theme.colors.text,
        fontFamily: mono ? theme.fonts.monospace : theme.fonts.body,
        fontWeight: 500,
      }}
    >
      {value}
    </span>
  </div>
);

/**
 * Main panel component wrapped with ThemeProvider
 */
export const GitPullRequestDetailPanel: React.FC<PanelComponentProps> = (props) => {
  return (
    <ThemeProvider>
      <GitPullRequestDetailPanelContent {...props} />
    </ThemeProvider>
  );
};

/**
 * Preview component for panel configuration UI
 */
export const GitPullRequestDetailPanelPreview: React.FC = () => {
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
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '999px',
            backgroundColor: `${theme.colors.success || '#22c55e'}20`,
            color: theme.colors.success || '#22c55e',
            fontFamily: theme.fonts.heading,
            fontSize: theme.fontSizes[0],
            fontWeight: 600,
          }}
        >
          <GitPullRequest size={10} />
          Open
        </span>
        <span style={{ fontFamily: theme.fonts.monospace, color: theme.colors.textSecondary }}>
          #42
        </span>
      </div>
      <div style={{ fontFamily: theme.fonts.heading, fontWeight: 600 }}>
        Refine panel layout system
      </div>
      <div
        style={{
          color: theme.colors.textSecondary,
          fontSize: theme.fontSizes[0],
          lineHeight: 1.4,
        }}
      >
        View full PR description with markdown rendering.
      </div>
    </div>
  );
};
