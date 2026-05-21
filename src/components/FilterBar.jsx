// FilterBar.jsx
//
// Renders the status filter buttons and search input.
//
// BUG (T-03): The filter buttons update `activeLabel` (local visual state)
// but do NOT call `onFilterChange` — so the parent never receives the new
// filter value and the grid doesn't update.
//
// Fix: call onFilterChange(filter.value) inside handleClick.
//
// BUG (T-03): Search input has an onChange handler but it also doesn't
// propagate to the parent — onSearchChange is never called.

import React from 'react'

const FILTERS = [
  { label: 'All',       value: 'all' },
  { label: 'Active',    value: 'active' },
  { label: 'Blocked',   value: 'blocked' },
  { label: 'Review',    value: 'review' },
  { label: 'Completed', value: 'completed' },
]

export default function FilterBar({
  activeFilter,      // current filter value from parent
  onFilterChange,    // parent setter — should be called on click
  searchQuery,       // current search string from parent
  onSearchChange,    // parent setter — should be called on input
  onSummarise,       // handler for the AI summary button (T-09)
}) {
  function handleClick(filter) {
    onFilterChange(filter.value)
  }

  return (
    <div className="filter-bar">
      {FILTERS.map(f => (
        <button
          key={f.value}
          className={`filter-btn ${activeFilter === f.value ? 'active' : ''}`}
          onClick={() => handleClick(f)}
        >
          {f.label}
        </button>
      ))}

      <div className="filter-bar-right">
        <input
          className="search-input"
          type="text"
          placeholder="Search workflows..."
          value={searchQuery}
          onChange={e => {
            onSearchChange(e.target.value)
          }}
        />

        {/* T-09: Summarise button — wire to onSummarise */}
        <button className="btn-summarise" onClick={onSummarise}>
          Summarise today
        </button>
      </div>
    </div>
  )
}
