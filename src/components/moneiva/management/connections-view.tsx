"use client"

import Link from "next/link"
import { useState } from "react"
import { CircleAlert, Database, Ellipsis, Mail, MessageSquare, Plug, Plus, Search, Truck } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/moneiva/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

/**
 * Connections: every account Moneiva signs in to, and which agents use it.
 * The current app lists credentials by who made them; this lists them by what they're for.
 */

type Conn = {
  name: string
  account: string
  app: string
  icon: typeof Mail
  usedBy: { name: string; href: string }[]
  status: "ok" | "expiring" | "signin"
  note: string
  by: string
}

const CONNS: Conn[] = [
  { name: "Customer service inbox", account: "service@example.test", app: "Microsoft 365", icon: Mail, usedBy: [{ name: "Email and texts", href: "/agents/op" }], status: "ok", note: "Last used 2 min ago", by: "TM" },
  { name: "Billing inbox", account: "billing@example.test", app: "Microsoft 365", icon: Mail, usedBy: [{ name: "Email and texts", href: "/agents/op" }], status: "expiring", note: "Sign-in expires in 9 days", by: "JL" },
  { name: "Claims inbox", account: "claims@example.test", app: "Google Workspace", icon: Mail, usedBy: [{ name: "Email and texts", href: "/agents/op" }], status: "ok", note: "Last used 1 hr ago", by: "TM" },
  { name: "Acme TMS", account: "moneiva-api", app: "TMS", icon: Truck, usedBy: [{ name: "Email and texts", href: "/agents/op" }, { name: "Inbound phone line", href: "/agents/phone" }, { name: "Carrier check calls", href: "/agents/check" }], status: "ok", note: "Look up only · last used just now", by: "JL" },
  { name: "Shipment warehouse", account: "Reporting database", app: "Data warehouse", icon: Database, usedBy: [{ name: "Catalog updates", href: "/agents/cat" }, { name: "Trends and KPIs", href: "/trends" }], status: "ok", note: "Last used today", by: "SK" },
  { name: "Text messages", account: "(555) 010-0345", app: "SMS", icon: MessageSquare, usedBy: [{ name: "Email and texts", href: "/agents/op" }], status: "ok", note: "Last used 20 min ago", by: "TM" },
  { name: "Team chat alerts", account: "#cs-alerts", app: "Team chat", icon: MessageSquare, usedBy: [{ name: "OS&D phone check", href: "/workflows/osd-phone-check" }], status: "signin", note: "Needs a new sign-in. Alerts are paused.", by: "JL" },
]

const STATUS = {
  ok: { label: "Connected", cls: "text-green-700 dark:text-green-400", dot: "bg-green-600" },
  expiring: { label: "Expires soon", cls: "text-amber-800 dark:text-amber-300", dot: "bg-amber-500" },
  signin: { label: "Sign in again", cls: "text-red-700 dark:text-red-400", dot: "bg-red-600" },
}

export function ConnectionsView() {
  const [q, setQ] = useState("")
  const term = q.toLowerCase()
  const rows = CONNS.filter((c) => !term || `${c.name} ${c.account} ${c.app} ${c.usedBy.map((u) => u.name).join(" ")}`.toLowerCase().includes(term))
  const broken = CONNS.filter((c) => c.status === "signin")
  return (
    <>
      <PageHeader
        title="Connections"
        description="The accounts and systems your agents sign in to. See what uses each one before you change it."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus /> Add connection
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Connect</DropdownMenuLabel>
              {["Google Workspace inbox", "Microsoft 365 inbox", "TMS", "Data warehouse", "Team chat"].map((a) => (
                <DropdownMenuItem key={a} onSelect={() => toast(`Mockup: opens the ${a} sign-in.`)}>
                  {a}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      {broken.length ? (
        <div className="flex flex-wrap items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <CircleAlert className="size-4 flex-none" />
          <span className="flex-1">
            {broken[0].name} needs a new sign-in. {broken[0].usedBy[0].name} can&apos;t send alerts until it&apos;s fixed.
          </span>
          <Button size="sm" variant="outline" onClick={() => toast.success(`${broken[0].name} signed in again.`)}>
            Sign in again
          </Button>
        </div>
      ) : null}

      <div className="relative w-full max-w-80">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search connections or agents" className="pl-9" aria-label="Search connections" />
      </div>

      <Card className="gap-0 overflow-hidden p-0">
        <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,1fr)_40px] gap-4 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground md:grid">
          <span>Connection</span>
          <span>Used by</span>
          <span>Status</span>
          <span />
        </div>
        <ul className="divide-y">
          {rows.map((c) => (
            <li key={c.name} className="grid grid-cols-[minmax(0,1fr)_40px] items-center gap-x-4 gap-y-2 px-4 py-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_minmax(0,1fr)_40px]">
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 flex-none place-items-center rounded-lg bg-muted text-muted-foreground">
                  <c.icon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-col leading-snug">
                  <span className="truncate text-sm font-medium">{c.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {c.app} · {c.account}
                  </span>
                </span>
              </span>
              <span className="col-start-1 flex flex-wrap gap-1 md:col-start-auto">
                {c.usedBy.map((u) => (
                  <Link key={u.name} href={u.href} className="rounded-full border px-2 py-0.5 text-xs hover:bg-muted">
                    {u.name}
                  </Link>
                ))}
              </span>
              <span className="col-start-1 flex flex-col md:col-start-auto">
                <span className={cn("inline-flex items-center gap-1.5 text-[13px] font-medium", STATUS[c.status].cls)}>
                  <i className={cn("size-2 rounded-full", STATUS[c.status].dot)} />
                  {STATUS[c.status].label}
                </span>
                <span className="text-xs text-muted-foreground">{c.note}</span>
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`More for ${c.name}`} className="col-start-2 row-start-1 md:col-start-auto md:row-start-auto">
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Plug /> Test connection
                  </DropdownMenuItem>
                  <DropdownMenuItem>Sign in again</DropdownMenuItem>
                  <DropdownMenuItem>Rename</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      </Card>
      <span className="text-[13px] text-muted-foreground">Removing a connection stops the agents that use it. You&apos;ll see which ones before it&apos;s removed.</span>
    </>
  )
}
