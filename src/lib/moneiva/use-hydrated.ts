"use client"

import { useSyncExternalStore } from "react"

/** True once the browser has rendered, so pages that read browser storage don't flash an empty state. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}
