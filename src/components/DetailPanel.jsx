// DetailPanel.jsx
//
// T-05: Task detail side panel.
//
// This component is a SHELL. It renders the container and empty state
// but contains no real content logic. Candidate's job:
//   - Show workflow title, client, status (use StatusBadge — T-07)
//   - Render status history timeline from workflow.history
//   - Show last updated, due date, assignee
//   - Add a notes field (read from workflow.notes, allow editing)
//   - Panel should slide in when a card is selected
//
// The panel container and CSS class already exist in global.css.
// Wire it up here.
//
// Inline status colour map — copy-pasted again (T-07: extract to StatusBadge)

import React, { useEffect, useMemo, useState } from 'react'
import StatusBadge from './StatusBadge'

function formatDateTime(ts) {
  if (ts === null || ts === undefined || ts === '') return '—'
  const date = typeof ts === 'number' ? new Date(ts * 1000) : new Date(ts)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getSafeProgress(progress) {
  const numeric = Number(progress)
  if (!Number.isFinite(numeric)) {
    return { value: 0, label: '—' }
  }
  return {
    value: Math.max(0, Math.min(100, numeric)),
    label: `${Math.round(numeric)}%`,
  }
}

export default function DetailPanel({ workflow, users, onClose }) {
  const [actionMessage, setActionMessage] = useState('')
  // T-05: If no workflow is selected, show the empty state.
  if (!workflow) {
    return (
      <div className="detail-panel">
        <div className="detail-panel-empty">
          Select a workflow<br />to see details
        </div>
      </div>
    )
  }

  const safeWorkflow = workflow ?? {}
  const assignee =
    safeWorkflow.assignee && typeof safeWorkflow.assignee === 'object' && !Array.isArray(safeWorkflow.assignee)
      ? safeWorkflow.assignee
      : null
  const assigneeName = assignee?.name || 'Unassigned'
  const clientName = (safeWorkflow.client_name ?? '').trim() || 'Internal'
  const notes = typeof safeWorkflow.notes === 'string' && safeWorkflow.notes.trim() ? safeWorkflow.notes : 'No notes'
  const dueDate = safeWorkflow.due_date ? formatDateTime(safeWorkflow.due_date) : '—'
  const progress = getSafeProgress(safeWorkflow.progress)
  const history = Array.isArray(safeWorkflow.history) ? [...safeWorkflow.history] : []
  const suggestedActions = useMemo(() => {
    const actions = Array.isArray(safeWorkflow.suggested_actions) ? safeWorkflow.suggested_actions : []
    return [...new Set(actions.filter(action => typeof action === 'string' && action.trim()))]
  }, [safeWorkflow.suggested_actions])
  const sortedHistory = history.sort((a, b) => {
    const aDate = typeof a?.timestamp === 'number' ? new Date(a.timestamp * 1000) : new Date(a?.timestamp)
    const bDate = typeof b?.timestamp === 'number' ? new Date(b.timestamp * 1000) : new Date(b?.timestamp)
    const aTime = Number.isNaN(aDate.getTime()) ? 0 : aDate.getTime()
    const bTime = Number.isNaN(bDate.getTime()) ? 0 : bDate.getTime()
    return bTime - aTime
  })

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

  function handleQuickAction(action) {
    setActionMessage(`Queued: ${humanizeActionLabel(action)}`)
  }

  return (
    <div className="detail-panel">
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {safeWorkflow.id ?? '—'}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '15px',
              lineHeight: 1.3,
            }}>
              {safeWorkflow.title || 'Untitled workflow'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {clientName}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
              padding: '2px 4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Inline status — T-07: this is the 3rd copy of this logic */}
        <div style={{ marginTop: '12px' }}>
          <StatusBadge status={safeWorkflow.status} />
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        fontSize: '11px',
        padding: '24px',
        lineHeight: 1.6,
      }}>
        <div style={{ display: 'grid', gap: '14px' }}>
          <div>
            <div className="muted" style={{ textTransform: 'uppercase', letterSpacing: '0.6px', fontSize: '10px' }}>Assignee</div>
            <div style={{ marginTop: '4px' }}>{assigneeName}</div>
          </div>

          <div>
            <div className="muted" style={{ textTransform: 'uppercase', letterSpacing: '0.6px', fontSize: '10px' }}>Due Date</div>
            <div style={{ marginTop: '4px' }}>{dueDate}</div>
          </div>

          <div>
            <div className="muted" style={{ textTransform: 'uppercase', letterSpacing: '0.6px', fontSize: '10px' }}>Progress</div>
            <div className="progress-bar-wrap" style={{ marginTop: '6px' }}>
              <div className="progress-bar-fill" style={{ width: `${progress.value}%` }} />
            </div>
            <div className="muted" style={{ marginTop: '4px', fontSize: '10px' }}>{progress.label}</div>
          </div>

          <div>
            <div className="muted" style={{ textTransform: 'uppercase', letterSpacing: '0.6px', fontSize: '10px' }}>Notes</div>
            <div style={{ marginTop: '4px', color: notes === 'No notes' ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
              {notes}
            </div>
          </div>

          <div>
            <div className="muted" style={{ textTransform: 'uppercase', letterSpacing: '0.6px', fontSize: '10px' }}>Quick Actions</div>
            {suggestedActions.length === 0 ? (
              <div className="muted" style={{ marginTop: '4px' }}>No suggested actions</div>
            ) : (
              <div style={{ marginTop: '8px' }}>
                <div className="quick-actions-row">
                  {suggestedActions.map(action => (
                    <button
                      key={action}
                      type="button"
                      className="quick-action-btn"
                      onClick={() => handleQuickAction(action)}
                    >
                      {humanizeActionLabel(action)}
                    </button>
                  ))}
                </div>
                {actionMessage && <div className="quick-action-feedback">{actionMessage}</div>}
              </div>
            )}
          </div>

          <div>
            <div className="muted" style={{ textTransform: 'uppercase', letterSpacing: '0.6px', fontSize: '10px' }}>History</div>
            <div style={{ marginTop: '8px', display: 'grid', gap: '10px' }}>
              {sortedHistory.length === 0 ? (
                <div className="muted">No history available</div>
              ) : (
                sortedHistory.map((entry, index) => {
                  const userId = entry?.user
                  const userName = users?.[userId]?.name || userId || 'Unknown'
                  const action = typeof entry?.action === 'string' && entry.action.trim()
                    ? entry.action
                    : 'No action'
                  return (
                    <div key={`${entry?.timestamp ?? 'missing'}-${entry?.user ?? 'unknown'}-${index}`} style={{ borderLeft: '1px solid var(--border)', paddingLeft: '8px' }}>
                      <div className="muted" style={{ fontSize: '10px' }}>{formatDateTime(entry?.timestamp)}</div>
                      <div style={{ marginTop: '2px', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{userName}</strong> {action}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
