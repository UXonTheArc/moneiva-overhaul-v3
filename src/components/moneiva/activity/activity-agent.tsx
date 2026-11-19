"use client"

import Link from "next/link"
import { Check, Clock, Minus, Pencil, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { KindIcon } from "@/components/moneiva/agents/kind-icon"
import { StageBadge, StatusDot } from "@/components/moneiva/status"
import { Button } from "@/components/ui/button"
import { agentById, isLearning, KIND_LABEL } from "@/lib/moneiva/agents-data"
import { FLOWS, STEP_COLOR, type AgentId } from "@/lib/moneiva/agents-extra-data"
import type { ActivityRow } from "@/lib/moneiva/activity-data"

type Mark = "ok" | "bad" | "wait" | "skip" | "none"

/** Which steps of the agent's canvas this run went through, and where it stopped. */
function pathFor(r: ActivityRow, kinds: string[]): { mark: Mark; note?: string }[] {
  const agentAt = kinds.indexOf("Agent")
  const approvalAt = kinds.indexOf("Approval")
  const actionAt = kinds.indexOf("Action")
  return kinds.map((k, i) => {
    if (r.status === "fail") {
      if (i < agentAt) return { mark: "ok" }
      if (i === agentAt) return { mark: "bad", note: "Stopped here. It couldn't finish." }
      return k === "Record" ? { mark: "ok", note: "Logged what happened" } : { mark: "none" }
    }
    if (r.status === "prog") {
      if (i <= agentAt) return { mark: i === agentAt ? "wait" : "ok", note: i === agentAt ? `At ${r.stage}: it made a guess and is watching what your team does` : undefined }
      return { mark: "none" }
    }
    if (r.status === "ign") {
      if (i <= agentAt) return { mark: "ok", note: i === agentAt ? "Saw nothing to do" : undefined }
      return k === "Record" ? { mark: "ok" } : { mark: "skip" }
    }
    if (r.status === "needs") {
      const stop = approvalAt >= 0 ? approvalAt : actionAt
      if (i < stop) return { mark: "ok", note: k === "Check" ? `No. ${r.type} is at ${r.stage}` : undefined }
      if (i === stop) return { mark: "wait", note: "Waiting here for a person, in Inbox" }
      return { mark: "none" }
    }
    // done
    if (k === "Check") return { mark: "ok", note: `No. ${r.type} is at ${r.stage}` }
    if (k === "Approval") return { mark: "ok", note: r.by ? `Approved by ${r.by}` : undefined }
    return { mark: "ok" }
  })
}

const MARK_ICON: Record<Mark, React.ReactNode> = {
  ok: <Check className="size-3" />,
  bad: <X className="size-3" />,
  wait: <Clock className="size-3" />,
  skip: <Minus className="size-3" />,
  none: null,
}

/** Canvas tab: the agent's canvas with this run's path lit up, and a way into the editor. */
export function RunCanvas({ row, agentId }: { row: ActivityRow; agentId: AgentId }) {
  const steps = FLOWS[agentId]
  const path = pathFor(
    row,
    steps.map((s) => s.kind)
  )
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[13px] text-muted-foreground">The steps this run took through {agentById(agentId)!.name}&apos;s canvas.</span>
        <span className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <i className="size-2 rounded-full bg-primary" /> Ran
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="size-2 rounded-full bg-zinc-300" /> Didn&apos;t reach
          </span>
        </span>
      </div>
      <div className="rounded-xl border bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] [background-size:16px_16px] p-4">
        <ol className="flex flex-col items-stretch">
          {steps.map((s, i) => {
            const m = path[i]
            const ran = m.mark !== "none" && m.mark !== "skip"
            return (
              <li key={s.title} className="flex flex-col items-center">
                {i > 0 ? <span aria-hidden className={cn("h-4 w-0.5", ran ? "bg-primary" : "bg-border")} /> : null}
                <div
                  className={cn(
                    "w-full max-w-[400px] rounded-lg border bg-background px-3.5 py-2.5 transition-opacity",
                    !ran && "opacity-50",
                    m.mark === "bad" && "border-red-300 ring-1 ring-red-300 dark:border-red-800 dark:ring-red-800",
                    m.mark === "wait" && "border-amber-300 ring-1 ring-amber-300 dark:border-amber-800 dark:ring-amber-800"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded-full text-[11px] font-semibold text-white" style={{ background: STEP_COLOR[s.kind] ?? "#52525b" }}>
                      {i + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">{s.kind}</span>
                    {MARK_ICON[m.mark] ? (
                      <span
                        className={cn(
                          "ml-auto grid size-5 place-items-center rounded-full border",
                          m.mark === "ok" && "border-primary bg-primary text-primary-foreground",
                          m.mark === "bad" && "border-red-200 bg-red-100 text-red-800",
                          m.mark === "wait" && "border-amber-200 bg-amber-100 text-amber-800",
                          m.mark === "skip" && "text-muted-foreground"
                        )}
                      >
                        {MARK_ICON[m.mark]}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-sm font-medium">{s.title}</div>
                  <div className="text-[13px] text-muted-foreground">{m.note ?? s.sub}</div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
      <div className="flex flex-col gap-2 rounded-lg bg-muted/50 px-4 py-3">
        <span className="text-sm">Want it to handle this differently next time?</span>
        <span className="text-[13px] text-muted-foreground">
          Changes go in a draft and only apply to new runs after you publish. This run stays as it happened.
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild size="sm">
            <Link href={`/agents/${agentId}?tab=flow&edit=1`}>
              <Pencil /> Edit the canvas
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/agents/${agentId}?tab=flow`}>Open full canvas</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Agent tab: which agent handled it, what it may do, and what it used on this run. */
export function RunAgent({ row, agentId }: { row: ActivityRow; agentId: AgentId }) {
  const a = agentById(agentId)!
  const learning = isLearning(a)
  const tools = a.tools.filter((t) => t[3])
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3 rounded-lg border px-4 py-3.5">
        <KindIcon kind={a.kind} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={a.href} className="font-medium hover:underline">
            {a.name}
          </Link>
          <span className="text-[13px] text-muted-foreground">
            {learning ? "Learning agent for the Operator" : "Task agent"} · {KIND_LABEL[a.kind]} · {a.address}
          </span>
          <span className="mt-1.5 text-xs text-muted-foreground">Version used: published Oct 2 by Jordan Lee</span>
        </div>
        <StatusDot status={a.status} className="text-[13px]" />
      </div>

      {learning ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
          <span className="flex flex-col">
            <span className="text-[13px] text-muted-foreground">How much it may do for {row.type}</span>
            <span className="text-sm">Set per request type in the Playbook, not on the agent</span>
          </span>
          <StageBadge stage={row.stage} />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-lg border px-4 py-3.5 text-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-muted-foreground">Who it is</span>
          <span>{a.who}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-muted-foreground">It may</span>
          <span>{a.may}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-muted-foreground">It may not</span>
          <span>{a.mayNot}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] text-muted-foreground">Tools it has</span>
        <ul className="flex flex-col divide-y rounded-lg border">
          {tools.map(([name, desc]) => (
            <li key={name} className="flex flex-col px-4 py-2.5">
              <span className="text-sm font-medium">{name}</span>
              <span className="text-[13px] text-muted-foreground">{desc}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={a.href}>Edit who it is</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`${a.href}?tab=tools`}>Change its tools</Link>
        </Button>
      </div>
    </div>
  )
}
