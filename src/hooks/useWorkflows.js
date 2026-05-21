// useWorkflows.js
// Custom hook that loads workflow data from data.json.
//
// KNOWN ISSUES (intentional — see task list):
//   T-04: No loading state — component renders with null data during fetch.
//   T-04: No error handling — if fetch fails, the app goes blank silently.
//         Fix: add loading/error states and render feedback to the user.

import { useState, useEffect } from 'react'

export function useWorkflows() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadWorkflows() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/data.json', { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`)
        }

        const json = await response.json()
        setData(json)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err)
        }
      } finally {
        setLoading(false)
      }
    }

    loadWorkflows()

    return () => controller.abort()
  }, [])

  return { data, loading, error }
}
