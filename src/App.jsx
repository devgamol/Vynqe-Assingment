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

import React, { useEffect, useState } from 'react'
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
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const [activityFeedHeight, setActivityFeedHeight] = useState(160)
  const [currentPage, setCurrentPage] = useState(1)

  const allWorkflows = Array.isArray(data?.workflows) ? data.workflows : []
  const searchTerm = searchQuery.trim().toLowerCase()

  const filteredWorkflows = allWorkflows.filter(workflow => {
    const workflowStatus = normaliseStatus(workflow?.status)
    const matchesFilter =
      activeFilter === 'all' ? true : workflowStatus === normaliseStatus(activeFilter)

    if (!matchesFilter) return false
    if (!searchTerm) return true

    const title = String(workflow?.title ?? '').toLowerCase()
    const client = String(workflow?.client_name ?? '').toLowerCase()
    const id = String(workflow?.id ?? '').toLowerCase()

    return title.includes(searchTerm) || client.includes(searchTerm) || id.includes(searchTerm)
  })
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

  function handleSummarise() {
    // T-09: Mock AI summary. Wire this up.
    // Candidate can use the Anthropic API, a mocked response, or anything creative.
    alert('T-09: Build the AI summary here.')
  }

  function startActivityResize(event) {
    event.preventDefault()
    const startY = event.clientY
    const startHeight = activityFeedHeight

    function onMouseMove(moveEvent) {
      const delta = startY - moveEvent.clientY
      const nextHeight = Math.max(120, Math.min(window.innerHeight * 0.55, startHeight + delta))
      setActivityFeedHeight(nextHeight)
    }

    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
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
                  onClick={setSelectedWorkflow}
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
            onMouseDown={startActivityResize}
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
        <DetailPanel
          workflow={selectedWorkflow}
          users={data?.users}
          onClose={() => setSelectedWorkflow(null)}
        />
      </div>

      {/* TODO: T-08 */}
      {/* <ActionBar workflow={selectedWorkflow} /> */}
    </div>
  )
}
