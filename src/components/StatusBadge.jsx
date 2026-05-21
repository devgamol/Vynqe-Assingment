import React from 'react'

export function normaliseStatus(status) {
  const value = String(status ?? '').trim().toLowerCase()
  if (value === 'in progress') return 'active'
  if (value === 'active' || value === 'blocked' || value === 'review' || value === 'completed') {
    return value
  }
  return 'unknown'
}

function getStatusColour(normalisedStatus) {
  switch (normalisedStatus) {
    case 'active': return 'var(--status-active)'
    case 'blocked': return 'var(--status-blocked)'
    case 'review': return 'var(--status-review)'
    case 'completed': return 'var(--status-completed)'
    default: return 'var(--status-unknown)'
  }
}

export default function StatusBadge({ status, variant = 'default', count, style }) {
  const normalisedStatus = normaliseStatus(status)
  const colour = getStatusColour(normalisedStatus)
  const label = normalisedStatus
  const text = variant === 'count' && typeof count === 'number'
    ? `${count} ${label}`
    : label

  return (
    <span className="status-label" style={{ color: colour, ...style }}>
      <span className="status-dot" style={{ background: colour }} />
      {text}
    </span>
  )
}
