// App.jsx
//
// Root component. Wires the layout together.
//
// KNOWN ISSUES (intentional bugs for the challenge):
//
//   T-02: Workflow cards below are HARDCODED. data.json is loaded via
//         useWorkflows() but `data` is not used to render the grid.
//         The grid renders 3 static placeholder cards instead.
//         Fix: replace hardcoded HARDCODED_CARDS with data?.workflows
//         and pass each workflow to <WorkflowCard>.
//
//   T-03: FilterBar's onFilterChange and onSearchChange are wired here
//         but FilterBar never calls them (see FilterBar.jsx).
//         Fix: fix the bug in FilterBar.jsx first, then filtering works.
//
//   T-04: useWorkflows has no loading/error state. Even if you fix the
//         hook, you need to render loading/error UI here too.
//
//   T-08: ActionBar is imported but commented out. The suggested_actions
//         field in data.json hints at what this could do.
//         // import ActionBar from './components/ActionBar'
//         // TODO: T-08 — <ActionBar workflow={selectedWorkflow} />

import React, { useEffect, useMemo, useState } from 'react'
import { useWorkflows } from './hooks/useWorkflows'
import FilterBar from './components/FilterBar'
import WorkflowCard from './components/WorkflowCard'
import DetailPanel from './components/DetailPanel'
import ActivityFeed from './components/ActivityFeed'
import StatusBadge, { normaliseStatus } from './components/StatusBadge'

// TODO: T-08
// import ActionBar from './components/ActionBar'

export default function App() {
  const { data, loading, error } = useWorkflows()

  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [activityFeedHeight, setActivityFeedHeight] = useState(160)
  const [currentPage, setCurrentPage] = useState(1)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(true)
  const [summaryModal, setSummaryModal] = useState(null)

  const allWorkflows = Array.isArray(data?.workflows) ? data.workflows : []
  const searchTerm = debouncedSearchQuery.trim().toLowerCase()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 280)

    return () => window.clearTimeout(timeoutId)
  }, [searchQuery])

  const filteredWorkflows = useMemo(() => allWorkflows.filter(workflow => {
    const workflowStatus = normaliseStatus(workflow?.status)
    const matchesFilter =
      activeFilter === 'all' ? true : workflowStatus === normaliseStatus(activeFilter)

    if (!matchesFilter) return false
    if (!searchTerm) return true

    const title = String(workflow?.title ?? '').toLowerCase()
    const client = String(workflow?.client_name ?? '').toLowerCase()
    const id = String(workflow?.id ?? '').toLowerCase()

    return title.includes(searchTerm) || client.includes(searchTerm) || id.includes(searchTerm)
  }), [allWorkflows, activeFilter, searchTerm])
  const WORKFLOWS_PER_PAGE = 6
  const totalPages = Math.max(1, Math.ceil(filteredWorkflows.length / WORKFLOWS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const pageStart = (safeCurrentPage - 1) * WORKFLOWS_PER_PAGE
  const paginatedWorkflows = filteredWorkflows.slice(pageStart, pageStart + WORKFLOWS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [activeFilter, searchTerm])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  if (loading) {
    return (
      <div className="state-fullscreen">
        Loading workflows...
      </div>
    )
  }

  if (error) {
    return (
      <div className="state-fullscreen">
        Unable to load workflows. Please refresh or try again.
      </div>
    )
  }

  function parseDateValue(value) {
    if (value === null || value === undefined || value === '') return null
    if (typeof value === 'number') {
      const millis = value > 1e12 ? value : value * 1000
      const fromNumber = new Date(millis)
      return Number.isNaN(fromNumber.getTime()) ? null : fromNumber
    }
    const fromString = new Date(value)
    return Number.isNaN(fromString.getTime()) ? null : fromString
  }

  function handleSummarise() {
    const now = new Date()
    const nowMs = now.getTime()

    const metrics = allWorkflows.reduce((acc, workflow) => {
      const status = normaliseStatus(workflow?.status)
      const rawStatus = String(workflow?.status ?? '').trim().toLowerCase()
      const dueDate = parseDateValue(workflow?.due_date)

      if (status === 'active') acc.active += 1
      if (status === 'blocked') acc.blocked += 1
      if (status === 'completed') acc.completed += 1
      if (status === 'review' || rawStatus === 'in progress') acc.reviewOrInProgress += 1
      if (dueDate && dueDate.getTime() < nowMs && status !== 'completed') acc.overdue += 1

      return acc
    }, {
      active: 0,
      blocked: 0,
      completed: 0,
      reviewOrInProgress: 0,
      overdue: 0,
    })

    let focusRecommendation = 'Keep momentum on active workflows and send concise progress updates.'
    if (metrics.blocked > 0) {
      focusRecommendation = `Prioritise unblocking ${metrics.blocked} workflow${metrics.blocked > 1 ? 's' : ''}, starting with overdue blockers.`
    } else if (metrics.overdue > 0) {
      focusRecommendation = `Triage ${metrics.overdue} overdue workflow${metrics.overdue > 1 ? 's' : ''} and reset owners/dates today.`
    } else if (metrics.reviewOrInProgress > 0) {
      focusRecommendation = `Push ${metrics.reviewOrInProgress} workflow${metrics.reviewOrInProgress > 1 ? 's' : ''} through review to protect delivery timelines.`
    }

    setSummaryModal({
      generatedAt: now,
      metrics,
      focusRecommendation,
    })
  }

  function handleSelectWorkflow(workflow) {
    setSelectedWorkflow(workflow)
    setIsDetailPanelOpen(true)
  }

  function startActivityResize(event) {
    event.preventDefault()
    const startY = event.clientY
    const startHeight = activityFeedHeight

    function onPointerMove(moveEvent) {
      const delta = startY - moveEvent.clientY
      const nextHeight = Math.max(120, Math.min(window.innerHeight * 0.55, startHeight + delta))
      setActivityFeedHeight(nextHeight)
    }

    function onPointerUp() {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  return (
    <div className="app-shell">

      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-logo">
          vynqe<span>ops</span>
        </div>

        {/* Inline status count — T-07: 5th place status logic appears */}
        <div style={{ display: 'flex', gap: '16px', marginLeft: '24px' }}>
          {['active', 'blocked', 'review'].map(s => {
            const count = filteredWorkflows.filter(
              w => normaliseStatus(w?.status) === s
            ).length
            return (
              <StatusBadge
                key={s}
                status={s}
                variant="count"
                count={count}
                style={{ fontSize: '11px' }}
              />
            )
          })}
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
          {data ? `${allWorkflows.length} workflows loaded` : 'loading data...'}
        </div>
        <button
          className="btn-toggle-panel"
          onClick={() => setIsDetailPanelOpen(open => !open)}
        >
          {isDetailPanelOpen ? 'Hide details' : 'Show details'}
        </button>
      </header>

      {/* Filter bar */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSummarise={handleSummarise}
      />

      {/* Main body */}
      <div className="main-body">
        <div className="content-area">

          {/* Workflow grid */}
          <div className="workflow-grid-container">
            <div className="workflow-grid">
              {paginatedWorkflows.map((workflow, index) => (
                <WorkflowCard
                  key={workflow?.id ?? `workflow-${index}`}
                  workflow={workflow}
                  isSelected={selectedWorkflow?.id === workflow?.id}
                  onClick={handleSelectWorkflow}
                />
              ))}
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
              >
                Previous
              </button>
              <span className="pagination-indicator">
                Page {safeCurrentPage} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>

          {/* Activity feed — T-06: shell only */}
          <div
            className="activity-resizer"
            onPointerDown={startActivityResize}
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize activity feed"
          />
          <ActivityFeed
            activityLog={data?.activity_log}
            users={data?.users}
            workflowIds={allWorkflows.map(w => w?.id).filter(Boolean)}
            height={activityFeedHeight}
          />
        </div>

        {/* Detail panel — T-05: empty shell */}
        {isDetailPanelOpen && (
          <DetailPanel
            workflow={selectedWorkflow}
            users={data?.users}
            onClose={() => setSelectedWorkflow(null)}
          />
        )}
      </div>

      {/* TODO: T-08 */}
      {/* <ActionBar workflow={selectedWorkflow} /> */}

      {summaryModal && (
        <div
          className="summary-modal-overlay"
          role="presentation"
          onClick={() => setSummaryModal(null)}
        >
          <div
            className="summary-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Operational summary"
            onClick={event => event.stopPropagation()}
          >
            <div className="summary-modal-header">
              <div>
                <div className="summary-modal-title">Today&apos;s Ops Summary</div>
                <div className="summary-modal-timestamp">
                  Generated {summaryModal.generatedAt.toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <button
                className="summary-modal-close"
                type="button"
                onClick={() => setSummaryModal(null)}
              >
                Close
              </button>
            </div>

            <div className="summary-metric-grid">
              <div className="summary-metric-card">
                <div className="summary-metric-label">Active</div>
                <div className="summary-metric-value">{summaryModal.metrics.active}</div>
              </div>
              <div className="summary-metric-card">
                <div className="summary-metric-label">Blocked</div>
                <div className="summary-metric-value">{summaryModal.metrics.blocked}</div>
              </div>
              <div className="summary-metric-card">
                <div className="summary-metric-label">Completed</div>
                <div className="summary-metric-value">{summaryModal.metrics.completed}</div>
              </div>
              <div className="summary-metric-card">
                <div className="summary-metric-label">Review / In Progress</div>
                <div className="summary-metric-value">{summaryModal.metrics.reviewOrInProgress}</div>
              </div>
              <div className="summary-metric-card">
                <div className="summary-metric-label">Overdue</div>
                <div className="summary-metric-value">{summaryModal.metrics.overdue}</div>
              </div>
            </div>

            <div className="summary-focus">
              <span className="summary-focus-label">Focus Recommendation:</span> {summaryModal.focusRecommendation}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
