// ActivityFeed.jsx
//
// T-06: Activity feed component.
//
// This is a SHELL. The container renders and the header shows,
// but nothing is displayed inside it.
//
// Candidate's job:
//   - Receive `activityLog` and `users` as props
//   - Sort entries newest first
//   - For each entry render: timestamp, user name (look up from users),
//     action text, and the workflow ID it belongs to
//   - Handle edge cases in the data:
//       - user: null (anonymous entries)
//       - action: "" (empty action string — wf_039)
//       - duplicate entries (act_022 and act_023 are identical)
//       - act_040 references wf_999 which doesn't exist in workflows
//
// The CSS for .activity-feed and .activity-feed-header is in global.css.
//
// Inline status colour — T-07: 4th copy of this logic. Extract to StatusBadge.

import React from 'react'

function toTimestamp(value) {
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  const time = date.getTime()
  return Number.isNaN(time) ? 0 : time
}

function formatActivityTime(value) {
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ActivityFeed({ activityLog, users, workflowIds, height }) {
  const entries = Array.isArray(activityLog) ? activityLog : []
  const knownWorkflowIds = new Set(Array.isArray(workflowIds) ? workflowIds : [])
  const sorted = [...entries].sort((a, b) => toTimestamp(b?.timestamp) - toTimestamp(a?.timestamp))

  return (
    <div className="activity-feed" style={height ? { height: `${Math.round(height)}px` } : undefined}>
      <div className="activity-feed-header">Activity</div>

      {sorted.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '8px' }}>
          No activity available
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {sorted.map((entry, index) => {
            const userId = entry?.user
            const userName = users?.[userId]?.name || userId || 'Unknown'
            const action = typeof entry?.action === 'string' && entry.action.trim()
              ? entry.action
              : 'No action provided'
            const workflowId = entry?.workflow_id || '—'
            const isOrphan = workflowId !== '—' && !knownWorkflowIds.has(workflowId)
            const workflowLabel = isOrphan ? `${workflowId} (missing workflow)` : workflowId

            return (
              <div
                key={entry?.id ?? `${workflowId}-${entry?.timestamp ?? 'na'}-${index}`}
                style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}
              >
                <span style={{ color: 'var(--text-muted)' }}>{formatActivityTime(entry?.timestamp)}</span>
                {' '}<strong style={{ color: 'var(--text-primary)' }}>{userName}</strong>{' '}{action}
                {' '}<span style={{ color: 'var(--text-muted)' }}>{workflowLabel}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
