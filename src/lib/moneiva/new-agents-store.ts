"use client"

import { useSyncExternalStore } from "react"

import type { Agent } from "./agents-data"
import type { FlowStep } from "./agents-extra-data"

/**
 * Agents made with Create agent on this visit. Mockup only: kept in session storage so the new agent
 * can be opened like the others, and cleared as soon as you leave the agent pages.
 */

export type NewAgent = { agent: Agent; flow: FlowStep[] }

const KEY = "moneiva-new-agents"
const listeners = new Set<() => void>()
let cache: { raw: string | null; value: NewAgent[] } = { raw: null, value: [] }

function read(): NewAgent[] {
  let raw: string | null = null
  try {
    raw = sessionStorage.getItem(KEY)
  } catch {}
  if (raw !== cache.raw) cache = { raw, value: raw ? (JSON.parse(raw) as NewAgent[]) : [] }
  return cache.value
}
const EMPTY: NewAgent[] = []

function write(v: NewAgent[]) {
  try {
    if (v.length) sessionStorage.setItem(KEY, JSON.stringify(v))
    else sessionStorage.removeItem(KEY)
  } catch {}
  listeners.forEach((l) => l())
}

export function addNewAgent(a: NewAgent) {
  write([a, ...read()])
}
export function clearNewAgents() {
  if (read().length) write([])
}
export function useNewAgents() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    read,
    () => EMPTY
  )
}
