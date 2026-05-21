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

import React, { useState } from 'react'
import { useWorkflows } from './hooks/useWorkflows'
import FilterBar from './components/FilterBar'
import WorkflowCard from './components/WorkflowCard'
import DetailPanel from './components/DetailPanel'
import ActivityFeed from './components/ActivityFeed'

// TODO: T-08
// import ActionBar from './components/ActionBar'

function normaliseStatus(status) {
  const value = String(status ?? '').trim().toLowerCase()
  if (value === 'in progress') return 'active'
  return value
}

export default function App() {
  const { data, loading, error } = useWorkflows()

  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)

  // T-04: No loading or error UI. App just renders with empty/null state.
  // Fix: add early returns here:
  //   if (loading) return <div className="state-fullscreen">Loading...</div>
  //   if (error)   return <div className="state-fullscreen">Error: {error.message}</div>

  // T-02: `data` is loaded but not used — grid uses HARDCODED_CARDS.
  // Fix: replace HARDCODED_CARDS with filtered data?.workflows
  //
  // T-03: Filter logic lives here but never runs because FilterBar
  // doesn't call onFilterChange. Fix FilterBar first.
  const allWorkflows = Array.isArray(data?.workflows) ? data.workflows : []
  const searchTerm = searchQuery.trim().toLowerCase()

  const displayedWorkflows = allWorkflows.filter(workflow => {
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

  function handleSummarise() {
    // T-09: Mock AI summary. Wire this up.
    // Candidate can use the Anthropic API, a mocked response, or anything creative.
    alert('T-09: Build the AI summary here.')
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
            const colours = {
              active:  'var(--status-active)',
              blocked: 'var(--status-blocked)',
              review:  'var(--status-review)',
            }
            // Uses hardcoded cards so count is always wrong until T-02 is fixed
            const count = displayedWorkflows.filter(
              w => w.status?.toLowerCase() === s
            ).length
            return (
              <span
                key={s}
                className="status-label"
                style={{ color: colours[s], fontSize: '11px' }}
              >
                <span className="status-dot" style={{ background: colours[s] }} />
                {count} {s}
              </span>
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
              {displayedWorkflows.map((workflow, index) => (
                <WorkflowCard
                  key={workflow?.id ?? `workflow-${index}`}
                  workflow={workflow}
                  isSelected={selectedWorkflow?.id === workflow?.id}
                  onClick={setSelectedWorkflow}
                />
              ))}
            </div>
          </div>

          {/* Activity feed — T-06: shell only */}
          <ActivityFeed
            activityLog={data?.activity_log}
            users={data?.users}
          />
        </div>

        {/* Detail panel — T-05: empty shell */}
        <DetailPanel
          workflow={selectedWorkflow}
          onClose={() => setSelectedWorkflow(null)}
        />
      </div>

      {/* TODO: T-08 */}
      {/* <ActionBar workflow={selectedWorkflow} /> */}
    </div>
  )
}
