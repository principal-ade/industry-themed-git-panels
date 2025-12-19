import React, { useEffect, useState } from 'react';
import {
  Settings,
  RefreshCcw,
  User,
  Mail,
  GitBranch,
  Globe,
  ChevronDown,
  ChevronRight,
  Key,
  Terminal,
  Zap,
  GitMerge,
  Upload,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useTheme } from '@principal-ade/industry-theme';
import type { PanelComponentProps } from '../types';
import type { GitConfigSliceData, GitRemoteInfo, GitBranchConfig } from '../types';

type ViewMode = 'summary' | 'detailed';

/**
 * GitConfigPanel - Displays git configuration for the current repository.
 *
 * This panel expects the host to provide config data through:
 * - context.getSlice<GitConfigSliceData>('gitConfig')
 *
 * The panel supports:
 * - Summary view with user, remotes, and branches
 * - Detailed view with all config entries
 * - Refresh via context.refresh()
 * - Tool events for programmatic interaction
 */
export const GitConfigPanel: React.FC<PanelComponentProps> = ({
  context,
  events,
}) => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['user', 'remotes'])
  );

  // Get config from the slice
  const configSlice = context.getSlice<GitConfigSliceData>('gitConfig');
  const hasConfig = context.hasSlice('gitConfig');
  const isLoading = context.isSliceLoading('gitConfig');
  const config = configSlice?.data;

  // Subscribe to panel events
  useEffect(() => {
    const unsubscribers = [
      // Tool: refresh config
      events.on<{ force?: boolean }>('git-panels.config:refresh', async () => {
        try {
          await context.refresh('repository', 'gitConfig');
        } catch (error) {
          console.error('[GitConfigPanel] Refresh failed:', error);
        }
      }),

      // Tool: set view mode
      events.on<{ mode: ViewMode }>('git-panels.config:set-view', (event) => {
        const mode = event.payload?.mode;
        if (mode && ['summary', 'detailed'].includes(mode)) {
          setViewMode(mode);
        }
      }),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [events, context]);

  const handleRefresh = async () => {
    try {
      await context.refresh('repository', 'gitConfig');
    } catch (error) {
      console.error('[GitConfigPanel] Refresh failed:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.colors.backgroundSecondary,
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
    return renderState('Connect a local repository to see git configuration.');
  }

  // No config slice available
  if (!hasConfig) {
    return renderState('Git configuration data is not available.');
  }

  // Loading state
  if (isLoading && !config) {
    return renderState('Loading git configuration...');
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: `1px solid ${theme.colors.border}`,
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
            color: theme.colors.textSecondary,
            textTransform: 'uppercase',
            fontWeight: 600,
            fontSize: theme.fontSizes[1],
          }}
        >
          <Settings size={14} />
          Git Configuration
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View mode toggle */}
          <div
            style={{
              display: 'flex',
              borderRadius: '6px',
              border: `1px solid ${theme.colors.border}`,
              overflow: 'hidden',
            }}
          >
            {(['summary', 'detailed'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '4px 10px',
                  border: 'none',
                  backgroundColor:
                    viewMode === mode
                      ? theme.colors.primary
                      : theme.colors.background,
                  color:
                    viewMode === mode
                      ? theme.colors.background
                      : theme.colors.text,
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {mode}
              </button>
            ))}
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
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {viewMode === 'summary' ? (
          <>
            {/* User Section */}
            <CollapsibleSection
              title="User"
              icon={<User size={14} />}
              expanded={expandedSections.has('user')}
              onToggle={() => toggleSection('user')}
              theme={theme}
            >
              <ConfigRow
                icon={<User size={12} />}
                label="Name"
                value={config?.user.name}
                theme={theme}
              />
              <ConfigRow
                icon={<Mail size={12} />}
                label="Email"
                value={config?.user.email}
                theme={theme}
              />
              {config?.user.signingKey && (
                <ConfigRow
                  icon={<Key size={12} />}
                  label="Signing Key"
                  value={config.user.signingKey}
                  theme={theme}
                  mono
                />
              )}
            </CollapsibleSection>

            {/* Remotes Section */}
            <CollapsibleSection
              title="Remotes"
              icon={<Globe size={14} />}
              expanded={expandedSections.has('remotes')}
              onToggle={() => toggleSection('remotes')}
              theme={theme}
              count={config?.remotes.length}
            >
              {config?.remotes.length === 0 ? (
                <div
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: '13px',
                    padding: '8px 0',
                  }}
                >
                  No remotes configured
                </div>
              ) : (
                config?.remotes.map((remote) => (
                  <RemoteCard key={remote.name} remote={remote} theme={theme} />
                ))
              )}
            </CollapsibleSection>

            {/* Branches Section */}
            <CollapsibleSection
              title="Branch Tracking"
              icon={<GitBranch size={14} />}
              expanded={expandedSections.has('branches')}
              onToggle={() => toggleSection('branches')}
              theme={theme}
              count={config?.branches.length}
            >
              {config?.branches.length === 0 ? (
                <div
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: '13px',
                    padding: '8px 0',
                  }}
                >
                  No branch tracking configured
                </div>
              ) : (
                config?.branches.map((branch) => (
                  <BranchCard key={branch.name} branch={branch} theme={theme} />
                ))
              )}
            </CollapsibleSection>

            {/* Core Settings Section */}
            <CollapsibleSection
              title="Core Settings"
              icon={<Terminal size={14} />}
              expanded={expandedSections.has('core')}
              onToggle={() => toggleSection('core')}
              theme={theme}
            >
              {config?.core.editor && (
                <ConfigRow
                  label="Editor"
                  value={config.core.editor}
                  theme={theme}
                  mono
                />
              )}
              {config?.core.autocrlf && (
                <ConfigRow
                  label="Auto CRLF"
                  value={config.core.autocrlf}
                  theme={theme}
                />
              )}
              <BooleanConfigRow
                label="FS Monitor"
                value={config?.core.fsmonitor}
                theme={theme}
                description="Filesystem monitoring for faster status"
              />
              <BooleanConfigRow
                label="Untracked Cache"
                value={config?.core.untrackedCache}
                theme={theme}
                description="Cache untracked files for performance"
              />
              <BooleanConfigRow
                label="Preload Index"
                value={config?.core.preloadIndex}
                theme={theme}
              />
              <BooleanConfigRow
                label="FS Cache"
                value={config?.core.fscache}
                theme={theme}
              />
              {config?.core.ignorecase !== undefined && (
                <ConfigRow
                  label="Ignore Case"
                  value={config.core.ignorecase ? 'true' : 'false'}
                  theme={theme}
                />
              )}
              {config?.core.filemode !== undefined && (
                <ConfigRow
                  label="File Mode"
                  value={config.core.filemode ? 'true' : 'false'}
                  theme={theme}
                />
              )}
            </CollapsibleSection>

            {/* Performance Section */}
            <CollapsibleSection
              title="Performance"
              icon={<Zap size={14} />}
              expanded={expandedSections.has('performance')}
              onToggle={() => toggleSection('performance')}
              theme={theme}
            >
              {config?.performance?.gcAuto !== undefined && (
                <ConfigRow
                  label="GC Auto"
                  value={String(config.performance.gcAuto)}
                  theme={theme}
                  description="Auto garbage collection threshold"
                />
              )}
              {config?.performance?.gcAutoPackLimit !== undefined && (
                <ConfigRow
                  label="GC Auto Pack Limit"
                  value={String(config.performance.gcAutoPackLimit)}
                  theme={theme}
                />
              )}
              {config?.performance?.packThreads !== undefined && (
                <ConfigRow
                  label="Pack Threads"
                  value={String(config.performance.packThreads)}
                  theme={theme}
                />
              )}
              {config?.performance?.packWindowMemory && (
                <ConfigRow
                  label="Pack Window Memory"
                  value={config.performance.packWindowMemory}
                  theme={theme}
                />
              )}
              <BooleanConfigRow
                label="feature.manyFiles"
                value={config?.performance?.featureManyFiles}
                theme={theme}
                description="Optimizations for large repos"
              />
              <BooleanConfigRow
                label="feature.experimental"
                value={config?.performance?.featureExperimental}
                theme={theme}
              />
            </CollapsibleSection>

            {/* Transfer Settings Section */}
            <CollapsibleSection
              title="Fetch / Pull / Push"
              icon={<Upload size={14} />}
              expanded={expandedSections.has('transfer')}
              onToggle={() => toggleSection('transfer')}
              theme={theme}
            >
              <BooleanConfigRow
                label="Fetch Prune"
                value={config?.transfer?.fetchPrune}
                theme={theme}
                description="Auto-prune on fetch"
              />
              <BooleanConfigRow
                label="Fetch Prune Tags"
                value={config?.transfer?.fetchPruneTag}
                theme={theme}
              />
              {config?.transfer?.pullRebase !== undefined && (
                <ConfigRow
                  label="Pull Rebase"
                  value={String(config.transfer.pullRebase)}
                  theme={theme}
                />
              )}
              {config?.transfer?.pullFf && (
                <ConfigRow
                  label="Pull Fast-Forward"
                  value={config.transfer.pullFf}
                  theme={theme}
                />
              )}
              {config?.transfer?.pushDefault && (
                <ConfigRow
                  label="Push Default"
                  value={config.transfer.pushDefault}
                  theme={theme}
                />
              )}
              <BooleanConfigRow
                label="Push Auto Setup Remote"
                value={config?.transfer?.pushAutoSetupRemote}
                theme={theme}
              />
              <BooleanConfigRow
                label="Push Follow Tags"
                value={config?.transfer?.pushFollowTags}
                theme={theme}
              />
            </CollapsibleSection>

            {/* Merge & Diff Section */}
            <CollapsibleSection
              title="Merge & Diff"
              icon={<GitMerge size={14} />}
              expanded={expandedSections.has('mergeDiff')}
              onToggle={() => toggleSection('mergeDiff')}
              theme={theme}
            >
              {config?.mergeDiff?.mergeFf && (
                <ConfigRow
                  label="Merge Fast-Forward"
                  value={config.mergeDiff.mergeFf}
                  theme={theme}
                />
              )}
              {config?.mergeDiff?.mergeConflictStyle && (
                <ConfigRow
                  label="Conflict Style"
                  value={config.mergeDiff.mergeConflictStyle}
                  theme={theme}
                />
              )}
              {config?.mergeDiff?.diffAlgorithm && (
                <ConfigRow
                  label="Diff Algorithm"
                  value={config.mergeDiff.diffAlgorithm}
                  theme={theme}
                />
              )}
              {config?.mergeDiff?.diffColorMoved && (
                <ConfigRow
                  label="Color Moved Lines"
                  value={config.mergeDiff.diffColorMoved}
                  theme={theme}
                />
              )}
              <BooleanConfigRow
                label="Rerere Enabled"
                value={config?.mergeDiff?.rerereEnabled}
                theme={theme}
                description="Reuse recorded resolution"
              />
            </CollapsibleSection>

            {/* Commit Settings Section */}
            <CollapsibleSection
              title="Commit"
              icon={<Key size={14} />}
              expanded={expandedSections.has('commit')}
              onToggle={() => toggleSection('commit')}
              theme={theme}
            >
              <BooleanConfigRow
                label="GPG Sign"
                value={config?.commit?.gpgSign}
                theme={theme}
                description="Sign commits with GPG"
              />
              {config?.commit?.template && (
                <ConfigRow
                  label="Template"
                  value={config.commit.template}
                  theme={theme}
                  mono
                />
              )}
              <BooleanConfigRow
                label="Verbose"
                value={config?.commit?.verbose}
                theme={theme}
              />
            </CollapsibleSection>
          </>
        ) : (
          /* Detailed view - all config entries */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {config?.allEntries.map((entry, index) => (
              <div
                key={`${entry.key}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  backgroundColor:
                    index % 2 === 0
                      ? theme.colors.background
                      : theme.colors.backgroundSecondary,
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              >
                <span
                  style={{
                    color: theme.colors.primary,
                    fontFamily: theme.fonts.monospace,
                    fontSize: '12px',
                    minWidth: '200px',
                  }}
                >
                  {entry.key}
                </span>
                <span
                  style={{
                    color: theme.colors.text,
                    fontFamily: theme.fonts.monospace,
                    fontSize: '12px',
                    flex: 1,
                    wordBreak: 'break-all',
                  }}
                >
                  {entry.value}
                </span>
                <span
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    backgroundColor: theme.colors.backgroundSecondary,
                    borderRadius: '4px',
                  }}
                >
                  {entry.scope}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Collapsible section component
 */
const CollapsibleSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
  count?: number;
  children: React.ReactNode;
}> = ({ title, icon, expanded, onToggle, theme, count, children }) => (
  <div
    style={{
      backgroundColor: theme.colors.background,
      borderRadius: '8px',
      border: `1px solid ${theme.colors.border}`,
      overflow: 'hidden',
    }}
  >
    <button
      type="button"
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px',
        border: 'none',
        backgroundColor: 'transparent',
        color: theme.colors.text,
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      {icon}
      {title}
      {count !== undefined && (
        <span
          style={{
            marginLeft: 'auto',
            color: theme.colors.textSecondary,
            fontSize: '12px',
            fontWeight: 400,
          }}
        >
          {count}
        </span>
      )}
    </button>
    {expanded && (
      <div
        style={{
          padding: '0 12px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {children}
      </div>
    )}
  </div>
);

/**
 * Config row component for key-value display
 */
const ConfigRow: React.FC<{
  icon?: React.ReactNode;
  label: string;
  value?: string;
  theme: ReturnType<typeof useTheme>['theme'];
  mono?: boolean;
  description?: string;
}> = ({ icon, label, value, theme, mono, description }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 0',
      borderBottom: `1px solid ${theme.colors.border}`,
    }}
  >
    {icon && <span style={{ color: theme.colors.textSecondary }}>{icon}</span>}
    <div style={{ minWidth: '140px' }}>
      <span
        style={{
          color: theme.colors.textSecondary,
          fontSize: '13px',
        }}
      >
        {label}
      </span>
      {description && (
        <div
          style={{
            color: theme.colors.textSecondary,
            fontSize: '11px',
            opacity: 0.7,
          }}
        >
          {description}
        </div>
      )}
    </div>
    <span
      style={{
        color: value ? theme.colors.text : theme.colors.textSecondary,
        fontSize: '13px',
        fontFamily: mono ? theme.fonts.monospace : 'inherit',
        fontStyle: value ? 'normal' : 'italic',
      }}
    >
      {value || 'Not configured'}
    </span>
  </div>
);

/**
 * Boolean config row with enabled/disabled indicator
 */
const BooleanConfigRow: React.FC<{
  label: string;
  value?: boolean | string;
  theme: ReturnType<typeof useTheme>['theme'];
  description?: string;
}> = ({ label, value, theme, description }) => {
  const isEnabled = value === true || value === 'true';
  const isDisabled = value === false || value === 'false';
  const isConfigured = value !== undefined;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 0',
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      <div style={{ minWidth: '140px', flex: 1 }}>
        <span
          style={{
            color: theme.colors.textSecondary,
            fontSize: '13px',
          }}
        >
          {label}
        </span>
        {description && (
          <div
            style={{
              color: theme.colors.textSecondary,
              fontSize: '11px',
              opacity: 0.7,
            }}
          >
            {description}
          </div>
        )}
      </div>
      {isConfigured ? (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 500,
            backgroundColor: isEnabled
              ? `${theme.colors.success || '#22c55e'}22`
              : isDisabled
                ? `${theme.colors.error || '#ef4444'}22`
                : theme.colors.backgroundSecondary,
            color: isEnabled
              ? theme.colors.success || '#22c55e'
              : isDisabled
                ? theme.colors.error || '#ef4444'
                : theme.colors.text,
          }}
        >
          {isEnabled ? (
            <>
              <CheckCircle size={12} /> Enabled
            </>
          ) : isDisabled ? (
            <>
              <XCircle size={12} /> Disabled
            </>
          ) : (
            String(value)
          )}
        </span>
      ) : (
        <span
          style={{
            color: theme.colors.textSecondary,
            fontSize: '12px',
            fontStyle: 'italic',
          }}
        >
          Not set
        </span>
      )}
    </div>
  );
};

/**
 * Remote card component
 */
const RemoteCard: React.FC<{
  remote: GitRemoteInfo;
  theme: ReturnType<typeof useTheme>['theme'];
}> = ({ remote, theme }) => (
  <div
    style={{
      padding: '10px',
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: '6px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}
  >
    <div
      style={{
        fontWeight: 600,
        color: theme.colors.text,
        fontSize: '13px',
      }}
    >
      {remote.name}
    </div>
    <div
      style={{
        color: theme.colors.textSecondary,
        fontSize: '12px',
        fontFamily: 'monospace',
        wordBreak: 'break-all',
      }}
    >
      {remote.fetchUrl}
    </div>
    {remote.pushUrl && remote.pushUrl !== remote.fetchUrl && (
      <div
        style={{
          color: theme.colors.textSecondary,
          fontSize: '11px',
        }}
      >
        Push: {remote.pushUrl}
      </div>
    )}
  </div>
);

/**
 * Branch card component
 */
const BranchCard: React.FC<{
  branch: GitBranchConfig;
  theme: ReturnType<typeof useTheme>['theme'];
}> = ({ branch, theme }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 10px',
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: '6px',
      fontSize: '13px',
    }}
  >
    <GitBranch size={12} style={{ color: theme.colors.textSecondary }} />
    <span style={{ color: theme.colors.text, fontWeight: 500 }}>
      {branch.name}
    </span>
    {branch.remote && (
      <>
        <span style={{ color: theme.colors.textSecondary }}>→</span>
        <span style={{ color: theme.colors.textSecondary }}>
          {branch.remote}/{branch.merge?.replace('refs/heads/', '') || branch.name}
        </span>
      </>
    )}
  </div>
);

/**
 * Preview component for panel configuration UI
 */
export const GitConfigPanelPreview: React.FC = () => {
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: theme.colors.textSecondary,
        }}
      >
        <User size={12} />
        <span>Alex Developer</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: theme.colors.textSecondary,
        }}
      >
        <Mail size={12} />
        <span>alex@example.com</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: theme.colors.textSecondary,
        }}
      >
        <Globe size={12} />
        <span>origin (github.com)</span>
      </div>
    </div>
  );
};
