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

import React from 'react'
import StatusBadge from './StatusBadge'

export default function DetailPanel({ workflow, onClose }) {
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

  // TODO (T-05): Build the full detail view here.
  // Right now it just shows the title and a placeholder.
  // Candidate should add:
  //   - Status badge (T-07)
  //   - Assignee
  //   - Due date / created date
  //   - Progress bar
  //   - History timeline (workflow.history)
  //   - Notes field
  //   - suggested_actions array (hint for T-08)

  return (
    <div className="detail-panel">
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {workflow.id}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: '15px',
              lineHeight: 1.3,
            }}>
              {workflow.title}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {workflow.client_name || <span style={{ color: 'var(--text-muted)' }}>No client</span>}
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
          <StatusBadge status={workflow.status} />
        </div>
      </div>

      {/* TODO (T-05): replace this placeholder with real content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '11px',
        padding: '24px',
        textAlign: 'center',
        lineHeight: 1.8,
      }}>
        T-05: Build the rest of this panel.<br />
        History, notes, dates, actions.
      </div>
    </div>
  )
}
