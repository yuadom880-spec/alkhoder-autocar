import { useEffect } from 'react'

import { subscribeToTable, type RealtimeTable } from '../lib/realtime'

export function useTableRealtime(
  table: RealtimeTable,
  onChange: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return
    return subscribeToTable(table, onChange)
  }, [table, onChange, enabled])
}