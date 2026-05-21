// WorkflowCard.jsx
//
// Renders a single workflow card in the grid.
//
// INTENTIONAL BUGS:
//   - assignee.name crash (T-02 / T-07): If assignee is null or {},
//     accessing assignee.name throws a TypeError. Candidate must guard
//     with optional chaining: assignee?.name
//
//   - progress bar (T-02): progress may be a string ("72") instead of
//     a number, which breaks the width calculation. Also progress > 100
//     (e.g. 143) renders a bar wider than its container.
//     Fix: clamp with Math.min(100, Number(workflow.progress))
//
//   - Status rendered inline (T-07): Status display logic is copy-pasted
//     here AND in DetailPanel, ActivityFeed header, topbar count, and
//     the summary modal. T-07 asks candidate to extract to StatusBadge.
//
//   - tags null crash (T-02): workflow.tags may be null instead of [].
//     Calling .map() on null throws. Candidate must guard: tags ?? []

import React, { useEffect, useMemo, useState } from 'react'
import StatusBadge from './StatusBadge'

function formatDate(ts) {
  if (!ts) return '—'
  try {
    // Handles both ISO strings and Unix epoch integers
    const d = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  } catch {
    return '—'
  }
}

export default function WorkflowCard({ workflow, isSelected, onClick }) {
  const [actionMessage, setActionMessage] = useState('')
  const safeWorkflow = workflow ?? {}
  const assignee =
    safeWorkflow.assignee && typeof safeWorkflow.assignee === 'object' && !Array.isArray(safeWorkflow.assignee)
      ? safeWorkflow.assignee
      : null
  const assigneeName = assignee?.name || 'Unassigned'
  const assigneeAvatar = assignee?.avatar || assigneeName.slice(0, 1).toUpperCase() || '?'

  const progressNum = Number(safeWorkflow.progress)
  const hasNumericProgress = Number.isFinite(progressNum)
  const rawProgressLabel = safeWorkflow.progress ?? '—'
  const progressLabel = hasNumericProgress ? `${Math.round(progressNum)}%` : `${rawProgressLabel}`
  const progressVal = hasNumericProgress ? Math.max(0, Math.min(100, progressNum)) : 0
  const clientName = (safeWorkflow.client_name ?? '').trim() || 'Internal'
  const tags = Array.isArray(safeWorkflow.tags) ? safeWorkflow.tags : []
  const notes = typeof safeWorkflow.notes === 'string' ? safeWorkflow.notes : ''
  const dueDate = safeWorkflow.due_date ?? null
  const priority = safeWorkflow.priority
  const suggestedActions = useMemo(() => {
    const actions = Array.isArray(safeWorkflow.suggested_actions) ? safeWorkflow.suggested_actions : []
    return [...new Set(actions.filter(action => typeof action === 'string' && action.trim()))]
  }, [safeWorkflow.suggested_actions])
  const visibleActions = suggestedActions.slice(0, 3)
  const overflowCount = Math.max(0, suggestedActions.length - visibleActions.length)

  useEffect(() => {
    if (!actionMessage) return undefined
    const timeoutId = window.setTimeout(() => setActionMessage(''), 2200)
    return () => window.clearTimeout(timeoutId)
  }, [actionMessage])

  function humanizeActionLabel(action) {
    return action
      .split('_')
      .filter(Boolean)
      .map(part => part[0].toUpperCase() + part.slice(1))
      .join(' ')
  }

  function handleQuickAction(event, action) {
    event.stopPropagation()
    setActionMessage(`Queued: ${humanizeActionLabel(action)}`)
  }

  return (
    <div
      className={`workflow-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(safeWorkflow)}
      title={notes || undefined}
      data-due-date={dueDate || undefined}
      data-priority={priority ?? undefined}
    >
      {/* Header row: ID + status badge (copy-pasted status logic — T-07) */}
      <div className="card-header">
        <span className="card-id">{safeWorkflow.id ?? '—'}</span>
        <StatusBadge status={safeWorkflow.status} />
      </div>

      {/* Title + client */}
      <div>
        <div className="card-title">{safeWorkflow.title || 'Untitled workflow'}</div>
        <div className="card-client">{clientName}</div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-wrap">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressVal}%` }}
        />
      </div>

      {/* Assignee + progress number */}
      <div className="card-meta">
        <div className="card-assignee">
          <div className="avatar">
            {/* BUG: assignee.avatar also throws when assignee is null */}
            {assigneeAvatar}
          </div>
          {assigneeName}
        </div>
        <span className="muted" style={{ fontSize: '10px' }}>
          {progressLabel}
        </span>
      </div>

      <div className="tags">
        {tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>

      {visibleActions.length > 0 && (
        <div className="quick-actions-wrap" onClick={event => event.stopPropagation()}>
          <div className="quick-actions-label">Quick Actions</div>
          <div className="quick-actions-row">
            {visibleActions.map(action => (
              <button
                key={action}
                type="button"
                className="quick-action-btn"
                onClick={event => handleQuickAction(event, action)}
              >
                {humanizeActionLabel(action)}
              </button>
            ))}
            {overflowCount > 0 && (
              <span className="quick-actions-more">+{overflowCount} more</span>
            )}
          </div>
          {actionMessage && <div className="quick-action-feedback">{actionMessage}</div>}
        </div>
      )}

      {/* Footer: last updated */}
      <div className="card-footer">
        <span className="card-updated">
          updated {formatDate(safeWorkflow.updated_at)}
        </span>
      </div>
    </div>
  )
}
