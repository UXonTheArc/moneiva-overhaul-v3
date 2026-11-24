"use client"

import { ArrowRight, Brain, CircleAlert, Ellipsis, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/moneiva/page-header"
import { StatusDot } from "@/components/moneiva/status"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LEARNING_AGENTS, TASK_AGENTS, type Agent } from "@/lib/moneiva/agents-data"
import { MANY_AGENTS } from "@/lib/moneiva/agents-many-data"
import { cn } from "@/lib/utils"
import type { AgentStatus } from "@/lib/moneiva/data"

import { AgentsTable } from "./agents-table"
import { CreateAgentDialog, type CreatedAgent } from "./create-agent-dialog"
import { KindIcon } from "./kind-icon"
import { MenuItem } from "./menus"
import { useQuery } from "./use-query"

export function AgentsList() {
  const q = useQuery()
  const [moved, setMoved] = useState<Record<string, AgentStatus>>({})
  const createOpen = q.get("create") === "1"
  const large = q.get("sample") === "large"
  // Agents made on this visit. Mockup only: they go away when you leave the page.
  const [created, setCreated] = useState<Agent[]>([])
  const onCreated = (c: CreatedAgent) =>
    setCreated((all) => [
      {
        ...TASK_AGENTS[0],
        id: `new-${all.length}` as Agent["id"],
        name: c.name,
        kind: c.kind,
        status: "off",
        team: c.team,
        address: c.address,
        channel: `${{ email: "Email", inbound: "Inbound calls", outbound: "Outbound calls", files: "Files" }[c.kind]} · ${c.address}`,
        desc: c.desc,
        error: undefined,
        today: "0",
        needs: "",
        workflow: c.start,
        href: "#",
      },
      ...all,
    ])

  const setStatus = (a: Agent, from: AgentStatus, to: AgentStatus, msg: string) => {
    setMoved((m) => ({ ...m, [a.id]: to }))
    toast(msg, {
      action: { label: "Undo", onClick: () => setMoved((m) => ({ ...m, [a.id]: from })) },
    })
  }

  return (
    <>
      <PageHeader
        title="Task agents"
        description="Task agents follow a script you set, and workflows decide when they run. Open one to change who it is, what it says, and how it runs."
        actions={
          <Button onClick={() => q.set({ create: "1" })}>
            <Plus /> Create agent
          </Button>
        }
      />
      <SampleSwitch large={large} onChange={(l) => q.set({ sample: l ? "large" : null })} />
      {large ? (
        <AgentsTable
          extra={created.map((a) => ({
            id: a.id,
            name: a.name,
            kind: a.kind,
            status: moved[a.id] ?? a.status,
            channel: a.channel,
            team: a.team,
            today: 0,
            todayLabel: a.todayLabel,
            runs: a.workflow,
            href: "#",
            fresh: true,
          }))}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {created.map((a) => (
            <AgentCard key={a.id} agent={a} status={moved[a.id] ?? a.status} onStatus={setStatus} fresh />
          ))}
          {TASK_AGENTS.map((a) => (
            <AgentCard key={a.id} agent={a} status={moved[a.id] ?? a.status} onStatus={setStatus} />
          ))}
        </div>
      )}
      <Link
        href="/operator"
        className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/40 px-5 py-4 transition-colors hover:bg-muted"
      >
        <Brain className="size-5 flex-none text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-[1_1_320px] text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">Looking for {LEARNING_AGENTS.map((a) => a.name).join(" or ")}?</span> Those are
          learning agents. They belong to the Operator and learn from your team, so they live under Operator.
        </span>
        <span className="inline-flex items-center gap-1 text-[13px] font-medium">
          Open the Operator <ArrowRight className="size-3.5" />
        </span>
      </Link>
      <CreateAgentDialog open={createOpen} onOpenChange={(o) => q.set({ create: o ? "1" : null })} onCreated={onCreated} />
    </>
  )
}

/** Mockup only: flip between a typical account and a large one, to show the page past about 9 agents. */
function SampleSwitch({ large, onChange }: { large: boolean; onChange: (large: boolean) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 self-start rounded-lg border border-dashed px-3 py-1.5 text-[13px] text-muted-foreground">
      Mockup sample:
      {[
        [false, `Typical account (${TASK_AGENTS.length} agents)`],
        [true, `Large account (${MANY_AGENTS.length} agents)`],
      ].map(([v, label]) => (
        <button
          key={String(v)}
          type="button"
          aria-pressed={large === v}
          onClick={() => onChange(v as boolean)}
          className={cn("rounded-md px-2 py-0.5", large === v ? "bg-muted font-medium text-foreground" : "hover:text-foreground")}
        >
          {label as string}
        </button>
      ))}
    </div>
  )
}

function AgentCard({
  agent: a,
  status,
  onStatus,
  fresh,
}: {
  agent: Agent
  status: AgentStatus
  onStatus: (a: Agent, from: AgentStatus, to: AgentStatus, msg: string) => void
  /** Just made on this visit: highlighted, with no page to open yet in this mockup. */
  fresh?: boolean
}) {
  const router = useRouter()
  return (
    <Card className={cn("gap-3 p-[18px]", fresh && "border-blue-300 ring-[3px] ring-blue-100 animate-in fade-in slide-in-from-top-2 duration-500 dark:border-blue-800 dark:ring-blue-950")}>
      <div className="flex items-start gap-3">
        <KindIcon kind={a.kind} />
        <span className="flex min-w-0 flex-1 flex-col leading-snug">
          {fresh ? (
            <span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
              {a.name}
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">Just created</span>
            </span>
          ) : (
            <Link href={a.href} className="text-[15px] font-semibold hover:underline">
              {a.name}
            </Link>
          )}
          <span className="text-[13px] text-muted-foreground">{a.channel}</span>
        </span>
        <StatusDot status={status} className="pt-0.5 text-[13px]" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${a.name}`} className="-mt-1 data-[state=open]:bg-accent">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[230px]">
            <MenuItem label="Open" onSelect={() => router.push(a.href)} />
            <MenuItem label="Test agent" sub="Try it without sending anything" onSelect={() => router.push(`${a.href}?test=1`)} />
            <MenuItem label="Duplicate" />
            {status === "off" ? (
              <MenuItem label="Turn on" onSelect={() => onStatus(a, status, "live", `${a.name} is live.`)} />
            ) : (
              <MenuItem
                label="Turn off"
                sub="New work goes to Inbox for a person"
                onSelect={() => onStatus(a, status, "off", `${a.name} turned off.`)}
              />
            )}
            <DropdownMenuSeparator />
            <MenuItem label="Delete" sub="Its history stays in Activity" danger />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-sm text-zinc-700 dark:text-zinc-300">{a.desc}</p>
      {status === "error" && a.error ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <CircleAlert className="mt-px size-4 flex-none" />
          <span>{a.error}</span>
        </div>
      ) : null}
      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2.5 text-[13px]">
        <span>
          <span className="font-semibold">{a.today}</span>
          <span className="text-muted-foreground"> {a.todayLabel}</span>
        </span>
        {a.needs ? (
          <Link href={a.needsHref ?? "/inbox"} className="font-medium text-amber-800 hover:underline dark:text-amber-300">
            {a.needs}
          </Link>
        ) : (
          <span className="text-muted-foreground">{a.workflow}</span>
        )}
      </div>
    </Card>
  )
}
