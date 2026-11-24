"use client"

import { useSyncExternalStore } from "react"

/**
 * Trends and KPIs. Every chart is built from one field an agent fills in (its Data tab),
 * so each one says which agent collected the data and from what.
 */

export type ChartKind = "stat" | "line" | "bars" | "breakdown"
export type Range = "24H" | "7D" | "30D" | "90D"

export type Kpi = {
  id: string
  title: string
  kind: ChartKind
  /** Agent that collects the data. "all" = added up across agents. */
  agentId: string
  agentName: string
  field: string
  from: string
  value: string
  unit?: string
  delta?: { text: string; good: boolean }
  /** Seven points, one per day (line, bars, stat sparkline). */
  points?: number[]
  /** Breakdown rows (at most 4 shown). */
  parts?: { label: string; value: number }[]
}

export const DAYS = ["Nov 18", "Nov 19", "Nov 20", "Nov 21", "Nov 22", "Nov 23", "Nov 24"]

export const KPIS: Kpi[] = [
  {
    id: "calls",
    title: "Calls answered",
    kind: "line",
    agentId: "phone",
    agentName: "Inbound phone line",
    field: "Call result",
    from: "Inbound calls to (555) 010-0345",
    value: "367",
    delta: { text: "12% more than last week", good: true },
    points: [48, 61, 57, 22, 14, 70, 95],
  },
  {
    id: "transfer",
    title: "Calls handed to a person",
    kind: "stat",
    agentId: "phone",
    agentName: "Inbound phone line",
    field: "Transferred",
    from: "Inbound calls",
    value: "4.1%",
    delta: { text: "down from 6.8%", good: true },
    points: [7, 6, 6, 5, 5, 4, 4],
  },
  {
    id: "why",
    title: "Why calls were handed off",
    kind: "breakdown",
    agentId: "phone",
    agentName: "Inbound phone line",
    field: "Transfer reason",
    from: "15 handed-off calls",
    value: "15",
    parts: [
      { label: "Asked for a person", value: 7 },
      { label: "Couldn't find the load", value: 5 },
      { label: "Billing question", value: 3 },
    ],
  },
  {
    id: "etas",
    title: "Carrier ETAs collected",
    kind: "bars",
    agentId: "check",
    agentName: "Carrier check calls",
    field: "ETA",
    from: "Outbound calls about late loads",
    value: "123",
    delta: { text: "9 more than last week", good: true },
    points: [0, 62, 16, 0, 0, 43, 2],
  },
  {
    id: "replies",
    title: "Email replies sent",
    kind: "bars",
    agentId: "op",
    agentName: "Email and texts",
    field: "Reply sent",
    from: "service@example.test and 2 more inboxes",
    value: "412",
    delta: { text: "18% more than last week", good: true },
    points: [71, 66, 80, 12, 9, 84, 90],
  },
  {
    id: "osd",
    title: "OS&D call outcomes",
    kind: "breakdown",
    agentId: "osd",
    agentName: "OS&D check calls",
    field: "Damage noted",
    from: "Calls to delivery sites",
    value: "38",
    parts: [
      { label: "Received in full", value: 21 },
      { label: "Damage noted", value: 11 },
      { label: "No answer", value: 6 },
    ],
  },
  {
    id: "time",
    title: "Team time saved",
    kind: "stat",
    agentId: "all",
    agentName: "All agents",
    field: "Handle time",
    from: "Every call and email it finished",
    value: "41",
    unit: "hours",
    delta: { text: "6 more than last week", good: true },
    points: [5, 7, 7, 2, 1, 9, 10],
  },
  {
    id: "intents",
    title: "What callers asked about",
    kind: "breakdown",
    agentId: "phone",
    agentName: "Inbound phone line",
    field: "Call intent",
    from: "Inbound calls",
    value: "367",
    parts: [
      { label: "Pickup or delivery status", value: 204 },
      { label: "Appointment change", value: 88 },
      { label: "Paperwork or POD", value: 47 },
      { label: "Other", value: 28 },
    ],
  },
]

/** What you can chart, by agent: the fields each agent fills in. */
export const SOURCES: { agentId: string; agentName: string; fields: string[] }[] = [
  { agentId: "op", agentName: "Email and texts", fields: ["Reply sent", "Request type", "Time to reply", "Approved by"] },
  { agentId: "phone", agentName: "Inbound phone line", fields: ["Call result", "Call intent", "Transferred", "Transfer reason", "Call length"] },
  { agentId: "check", agentName: "Carrier check calls", fields: ["ETA", "Delay reason", "Driver location"] },
  { agentId: "osd", agentName: "OS&D check calls", fields: ["Pieces received", "Damage noted", "Photos requested"] },
  { agentId: "all", agentName: "All agents", fields: ["Handle time", "Runs finished", "Couldn't finish"] },
]

// ---- Which charts are on Home, plus charts added in this browser (mockup only). ----

type Store = { pinned: string[]; added: Kpi[] }
const KEY = "moneiva-kpis"
const DEFAULT: Store = { pinned: ["calls", "transfer", "etas", "time"], added: [] }
const listeners = new Set<() => void>()
let cache: { raw: string | null; value: Store } = { raw: null, value: DEFAULT }

function read(): Store {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {}
  if (raw !== cache.raw) {
    try {
      cache = { raw, value: raw ? (JSON.parse(raw) as Store) : DEFAULT }
    } catch {
      cache = { raw, value: DEFAULT }
    }
  }
  return cache.value
}
function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {}
  listeners.forEach((l) => l())
}

export function useKpis() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    read,
    () => DEFAULT
  )
}
export const allKpis = (s: Store) => [...s.added, ...KPIS]
export function togglePin(id: string) {
  const s = read()
  write({ ...s, pinned: s.pinned.includes(id) ? s.pinned.filter((p) => p !== id) : [...s.pinned, id] })
}
export function addKpi(k: Kpi, pin: boolean) {
  const s = read()
  write({ added: [k, ...s.added], pinned: pin ? [...s.pinned, k.id] : s.pinned })
}
export function removeKpi(id: string) {
  const s = read()
  write({ added: s.added.filter((k) => k.id !== id), pinned: s.pinned.filter((p) => p !== id) })
}
