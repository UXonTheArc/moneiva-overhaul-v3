"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronRight, CircleAlert, Copy, Ellipsis, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { StatusDot } from "@/components/moneiva/status"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { AgentKind } from "@/lib/moneiva/agents-data"
import { KIND_LABEL, MANY_AGENTS, type ListAgent } from "@/lib/moneiva/agents-many-data"

import { KindIcon } from "./kind-icon"
import { MenuItem } from "./menus"

/**
 * Task agents for a large account. Past about 9 agents the card grid gets hard to scan, so the page
 * becomes a compact list: search, status and kind filters, agents that need you pinned on top,
 * and copies folded under the agent they were copied from.
 */

type StatusFilter = "all" | "needs" | "live" | "test" | "off"
const needsYou = (a: ListAgent) => a.status === "error" || !!a.needs

const STATUS_CHIPS: { key: StatusFilter; label: string; test: (a: ListAgent) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "needs", label: "Needs you", test: needsYou },
  { key: "live", label: "Live", test: (a) => a.status === "live" },
  { key: "test", label: "Testing", test: (a) => a.status === "test" },
  { key: "off", label: "Off or paused", test: (a) => a.status === "off" || a.status === "paused" },
]

export function AgentsTable() {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [kind, setKind] = useState<AgentKind | "all">("all")
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const term = q.trim().toLowerCase()
  const chip = STATUS_CHIPS.find((c) => c.key === status)!
  const matches = (a: ListAgent) =>
    chip.test(a) && (kind === "all" || a.kind === kind) && (!term || `${a.name} ${a.team} ${a.channel}`.toLowerCase().includes(term))
  const filtering = status !== "all" || kind !== "all" || !!term

  const originals = MANY_AGENTS.filter((a) => !a.base)
  const copiesOf = (id: string) => MANY_AGENTS.filter((a) => a.base === id)
  const attention = MANY_AGENTS.filter(needsYou)

  // A group shows when the original or any copy matches. While filtering, groups open so matches are visible.
  const groups = originals
    .map((o) => ({ o, copies: copiesOf(o.id), hit: [o, ...copiesOf(o.id)].filter(matches) }))
    .filter((g) => g.hit.length)
  const shown = groups.reduce((n, g) => n + g.hit.length, 0)

  return (
    <div className="flex flex-col gap-5">
      {!filtering && attention.length ? (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-sm font-medium">Needs you · {attention.length}</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {attention.map((a) => (
              <Link
                key={a.id}
                href={a.href}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
                  a.status === "error"
                    ? "border-red-200 bg-red-50 hover:bg-red-100/70 dark:border-red-900 dark:bg-red-950"
                    : "border-amber-200 bg-amber-50 hover:bg-amber-100/70 dark:border-amber-900 dark:bg-amber-950"
                )}
              >
                <KindIcon kind={a.kind} size="sm" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{a.name}</span>
                  <span className={cn("text-[13px]", a.status === "error" ? "text-red-800 dark:text-red-200" : "text-amber-900 dark:text-amber-200")}>
                    {a.status === "error" ? (
                      <span className="inline-flex items-start gap-1">
                        <CircleAlert className="mt-0.5 size-3.5 flex-none" /> {a.error}
                      </span>
                    ) : (
                      a.needs
                    )}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-[1_1_240px] sm:max-w-80">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search agents, teams or numbers" className="pl-9" aria-label="Search agents" />
          {q ? (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="size-4" />
            </button>
          ) : null}
        </div>
        <Select value={kind} onValueChange={(v) => setKind(v as AgentKind | "all")}>
          <SelectTrigger className="w-44" aria-label="Kind of agent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All kinds</SelectItem>
            {(["outbound", "email", "files"] as const).map((k) => (
              <SelectItem key={k} value={k}>
                {KIND_LABEL[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Status">
          {STATUS_CHIPS.map((c) => {
            const n = MANY_AGENTS.filter(c.test).length
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={status === c.key}
                onClick={() => setStatus(c.key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[13px] transition-colors",
                  status === c.key ? "border-foreground bg-foreground text-background" : "hover:bg-muted"
                )}
              >
                {c.label} <span className={cn("tabular-nums", status === c.key ? "opacity-70" : "text-muted-foreground")}>{n}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <div className="hidden grid-cols-[minmax(0,1fr)_160px_130px_110px_minmax(0,220px)_40px] items-center gap-4 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground md:grid">
          <span>Agent</span>
          <span>Team</span>
          <span>Status</span>
          <span>Today</span>
          <span>Runs</span>
          <span />
        </div>
        {groups.length ? (
          <ul className="divide-y">
            {groups.map(({ o, copies, hit }) => {
              const expanded = filtering || !!open[o.id]
              const kids = filtering ? hit.filter((a) => a.base) : copies
              return (
                <li key={o.id}>
                  <Row
                    a={o}
                    dim={filtering && !matches(o)}
                    copies={copies.length}
                    expanded={expanded}
                    onToggle={copies.length && !filtering ? () => setOpen((s) => ({ ...s, [o.id]: !s[o.id] })) : undefined}
                  />
                  {expanded && kids.length ? (
                    <ul className="divide-y border-t bg-muted/20">
                      {kids.map((c) => (
                        <li key={c.id}>
                          <Row a={c} child />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
            No agents match.
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQ("")
                setStatus("all")
                setKind("all")
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </Card>
      <span className="text-[13px] text-muted-foreground">
        {filtering ? `${shown} of ${MANY_AGENTS.length} agents` : `${MANY_AGENTS.length} agents · ${originals.length} originals and ${MANY_AGENTS.length - originals.length} copies for customers and desks`}
      </span>
    </div>
  )
}

function Row({
  a,
  child,
  dim,
  copies = 0,
  expanded,
  onToggle,
}: {
  a: ListAgent
  child?: boolean
  dim?: boolean
  copies?: number
  expanded?: boolean
  onToggle?: () => void
}) {
  const router = useRouter()
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto_40px] items-center gap-x-4 gap-y-1 px-4 py-3 md:grid-cols-[minmax(0,1fr)_160px_130px_110px_minmax(0,220px)_40px]",
        dim && "opacity-60"
      )}
    >
      <span className={cn("flex min-w-0 items-center gap-3", child && "pl-9 md:pl-10")}>
        {child ? null : (
          <button
            type="button"
            onClick={onToggle}
            disabled={!onToggle}
            aria-label={onToggle ? `${expanded ? "Hide" : "Show"} copies of ${a.name}` : undefined}
            aria-expanded={onToggle ? expanded : undefined}
            className={cn("grid size-6 flex-none place-items-center rounded-md", onToggle ? "hover:bg-muted" : "invisible")}
          >
            <ChevronRight className={cn("size-4 transition-transform", expanded && "rotate-90")} />
          </button>
        )}
        <KindIcon kind={a.kind} size="sm" />
        <span className="flex min-w-0 flex-col leading-snug">
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 md:flex-nowrap">
            <Link href={a.href} className="text-sm font-medium hover:underline md:truncate">
              {a.name}
            </Link>
            {copies ? (
              <button
                type="button"
                onClick={onToggle}
                className="inline-flex flex-none items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                <Copy className="size-3" /> {copies} {copies === 1 ? "copy" : "copies"}
              </button>
            ) : null}
          </span>
          <span className="truncate text-xs text-muted-foreground">{a.channel}</span>
        </span>
      </span>
      <span className="hidden truncate text-[13px] text-muted-foreground md:block">{a.team}</span>
      <StatusDot status={a.status} className="text-[13px]" />
      <span className="hidden text-[13px] md:block">
        <span className="font-medium tabular-nums">{a.today}</span> <span className="text-muted-foreground">{a.todayLabel}</span>
      </span>
      <span className="hidden truncate text-[13px] md:block">
        {a.needs ? <span className="font-medium text-amber-800 dark:text-amber-300">{a.needs}</span> : <span className="text-muted-foreground">{a.runs}</span>}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${a.name}`} className="data-[state=open]:bg-accent">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[230px]">
          <MenuItem label="Open" onSelect={() => router.push(a.href)} />
          <MenuItem label="Test agent" sub="Try it without sending anything" onSelect={() => router.push(`${a.href}?test=1`)} />
          <MenuItem label="Duplicate" sub="For another customer or desk" />
          <MenuItem label={a.status === "off" ? "Turn on" : "Turn off"} />
          <DropdownMenuSeparator />
          <MenuItem label="Delete" sub="Its history stays in Activity" danger />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
