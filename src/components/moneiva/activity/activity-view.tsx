"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ACTIVITY,
  FILTER_MENUS,
  STATUS_DOT,
  STATUS_LABEL,
  type ActivityRow,
  type ActivityStatus,
  type FilterKey,
} from "@/lib/moneiva/activity-data"
import { ActivityStatusBadge, ChannelIcon } from "@/components/moneiva/activity/activity-bits"
import { ActivitySheet, type SheetTab } from "@/components/moneiva/activity/activity-sheet"
import { FacetFilter } from "@/components/moneiva/activity/facet-filter"
import { PeriodMenu } from "@/components/moneiva/home/period-menu"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export type Filters = Record<FilterKey, string[]>
export type ActivityInitial = { item?: string; tab: SheetTab; menu?: FilterKey; f: Filters }

const rowValue = (r: ActivityRow, key: FilterKey) =>
  key === "agent" ? r.agent : key === "channel" ? r.channel : key === "status" ? r.status : r.type

/** Keep the open row, tab and filters in the address bar so a state can be shared or reloaded. */
function syncUrl(item: string | null, tab: SheetTab, f: Filters) {
  const p = new URLSearchParams()
  if (item) {
    p.set("item", item)
    if (tab !== "summary") p.set("tab", tab)
  }
  for (const m of FILTER_MENUS) if (f[m.key].length) p.set(m.key, f[m.key].join(","))
  const qs = p.toString()
  window.history.replaceState(null, "", qs ? `/activity?${qs}` : "/activity")
}

export function ActivityView({ initial }: { initial: ActivityInitial }) {
  const [open, setOpen] = React.useState<string | null>(initial.item ?? null)
  const [tab, setTab] = React.useState<SheetTab>(initial.tab)
  const [menu, setMenu] = React.useState<FilterKey | null>(initial.menu ?? null)
  const [f, setF] = React.useState<Filters>(initial.f)
  const [query, setQuery] = React.useState("")

  const q = query.trim().toLowerCase()
  const rows = ACTIVITY.filter(
    (r) =>
      FILTER_MENUS.every((m) => f[m.key].length === 0 || f[m.key].includes(rowValue(r, m.key))) &&
      (!q || [r.from, r.customer, r.about, r.ref, r.type].some((s) => s.toLowerCase().includes(q)))
  )
  const current = ACTIVITY.find((r) => r.id === open)

  const openRow = (id: string) => {
    setOpen(id)
    setTab("summary")
    syncUrl(id, "summary", f)
  }
  const setFilter = (key: FilterKey, v: string[]) => {
    const next = { ...f, [key]: v }
    setF(next)
    syncUrl(open, tab, next)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-[360px] flex-[1_1_260px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            aria-label="Search activity"
            placeholder="Search by name, PRO, pickup or subject"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        {FILTER_MENUS.map((m) => (
          <FacetFilter
            key={m.key}
            title={m.title}
            options={m.opts.map((v) =>
              m.key === "status"
                ? { value: v, label: STATUS_LABEL[v as ActivityStatus], dot: STATUS_DOT[v as ActivityStatus] }
                : { value: v, label: v }
            )}
            selected={f[m.key]}
            onChange={(v) => setFilter(m.key, v)}
            open={menu === m.key}
            onOpenChange={(o) => setMenu(o ? m.key : null)}
          />
        ))}
        <PeriodMenu initial="Last 7 days" size="sm" />
      </div>

      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px] pl-4">When</TableHead>
              <TableHead className="w-[200px]">From</TableHead>
              <TableHead>About</TableHead>
              <TableHead className="w-[220px]">Request type</TableHead>
              <TableHead className="w-[140px] pr-4">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.id}
                onClick={() => openRow(r.id)}
                data-state={open === r.id ? "selected" : undefined}
                className={cn("cursor-pointer", open === r.id && "bg-sky-50 dark:bg-sky-950")}
              >
                <TableCell className="py-3 pl-4 text-muted-foreground">{r.when}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <ChannelIcon channel={r.channel} />
                    {r.from}
                  </span>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <button
                    type="button"
                    className="text-left font-normal hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      openRow(r.id)
                    }}
                  >
                    {r.about}
                  </button>
                  {r.note ? <div className="mt-0.5 text-[13px] text-muted-foreground">{r.note}</div> : null}
                </TableCell>
                <TableCell className="text-muted-foreground">{r.type}</TableCell>
                <TableCell className="pr-4">
                  <ActivityStatusBadge status={r.status} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No activity matches these filters.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Card>

      <ActivitySheet
        row={current}
        tab={tab}
        onTab={(t) => {
          setTab(t)
          syncUrl(open, t, f)
        }}
        onClose={() => {
          setOpen(null)
          syncUrl(null, tab, f)
        }}
      />
    </>
  )
}

const TABS: SheetTab[] = ["summary", "convo", "steps", "agent", "canvas"]
export const EMPTY_FILTERS: Filters = { agent: [], channel: [], status: [], type: [] }

/**
 * Deep links: ?item=r1 opens a row, &tab=convo|steps|agent|canvas picks the sheet tab,
 * ?status=needs (or agent, channel, type; comma separated) sets filters, ?menu=status opens a filter menu.
 */
export function ActivityFromParams() {
  const sp = useSearchParams()
  const f = Object.fromEntries(
    FILTER_MENUS.map((m) => [m.key, (sp.get(m.key) ?? "").split(",").filter((v) => m.opts.includes(v))])
  ) as Filters
  const tab = sp.get("tab") as SheetTab | null
  const menu = sp.get("menu") as FilterKey | null
  const initial: ActivityInitial = {
    item: sp.get("item") ?? undefined,
    tab: tab && TABS.includes(tab) ? tab : "summary",
    menu: menu && FILTER_MENUS.some((m) => m.key === menu) ? menu : undefined,
    f,
  }
  return <ActivityView initial={initial} />
}
