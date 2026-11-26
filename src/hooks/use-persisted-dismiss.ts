import { useCallback, useEffect, useState } from 'react'
import {
  readDismissed,
  writeDismissed,
  type DismissStorageKind
} from '../lib/persisted-dismiss'

/**
 * Hide a surface after Close; persist so it does not return every page navigation.
 */
export function usePersistedDismiss(key: string, kind: DismissStorageKind = 'local') {
  const [dismissed, setDismissed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setDismissed(readDismissed(key, kind))
    setReady(true)
  }, [key, kind])

  const dismiss = useCallback(() => {
    writeDismissed(key, kind)
    setDismissed(true)
  }, [key, kind])

  return { dismissed, dismiss, ready }
}
