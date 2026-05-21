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

import React from 'react'
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

      {/* Footer: last updated */}
      <div className="card-footer">
        <span className="card-updated">
          updated {formatDate(safeWorkflow.updated_at)}
        </span>
      </div>
    </div>
  )
}
