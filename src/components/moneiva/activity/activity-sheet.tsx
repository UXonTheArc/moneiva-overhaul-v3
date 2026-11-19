"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Clock, ExternalLink, MessageSquarePlus, Pause, Play, ThumbsDown, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { AGENTS } from "@/lib/moneiva/agents-data"
import type { AgentId } from "@/lib/moneiva/agents-extra-data"
import { RunAgent, RunCanvas } from "@/components/moneiva/activity/activity-agent"
import { INBOX_LINK, type ActivityRow } from "@/lib/moneiva/activity-data"
import { WRONG_REASONS } from "@/lib/moneiva/training-data"
import { StageBadge, ToneBadge } from "@/components/moneiva/status"
import { ActivityStatusBadge, ChannelIcon } from "@/components/moneiva/activity/activity-bits"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type SheetTab = "summary" | "convo" | "steps" | "agent" | "canvas"

const CALLOUT = {
  needs: { title: "Needs you", cls: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950", fg: "text-amber-800 dark:text-amber-200" },
  fail: { title: "Couldn't finish", cls: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950", fg: "text-red-800 dark:text-red-200" },
  prog: { title: "Watching your team", cls: "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950", fg: "text-sky-900 dark:text-sky-200" },
} as const

const AVATARS = ["bg-blue-100", "bg-indigo-100", "bg-amber-100", "bg-green-100"]
const initials = (n: string) =>
  n
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-sm">{children}</span>
    </div>
  )
}

// Same note and reject controls as Training's Suggested actions.
function Feedback() {
  const [mode, setMode] = React.useState<"note" | "reject" | null>(null)
  const [note, setNote] = React.useState("")
  const [reason, setReason] = React.useState<string>(WRONG_REASONS[0])
  const [rejected, setRejected] = React.useState(false)
  const panel = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (mode) panel.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [mode])
  const toggle = (m: "note" | "reject") => {
    setNote("")
    setMode((cur) => (cur === m ? null : m))
  }
  return (
    <div className="flex flex-col gap-3 border-t pt-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] text-muted-foreground">Was this handled right?</span>
        <span className="inline-flex gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Add a note"
                aria-expanded={mode === "note"}
                className={cn(
                  "text-muted-foreground hover:bg-sky-100 hover:text-blue-700 dark:hover:bg-sky-950 dark:hover:text-sky-300",
                  mode === "note" && "bg-sky-100 text-blue-700 dark:bg-sky-950 dark:text-sky-300"
                )}
                onClick={() => toggle("note")}
              >
                <MessageSquarePlus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add a note - the Operator relearns from it</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Reject"
                aria-pressed={rejected}
                className={cn(
                  "text-muted-foreground hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300",
                  (rejected || mode === "reject") && "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                )}
                onClick={() => toggle("reject")}
              >
                <ThumbsDown />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reject - this is wrong</TooltipContent>
          </Tooltip>
        </span>
      </div>
      {mode ? (
        <div ref={panel} className="flex flex-col gap-2.5 rounded-lg border p-3.5">
          <span className="font-medium">
            {mode === "note" ? "Say what is wrong or missing - the AI relearns from your note." : "What is wrong with how this was handled?"}
          </span>
          {mode === "reject" ? (
            <RadioGroup value={reason} onValueChange={setReason} className="gap-0.5">
              {WRONG_REASONS.map((r) => (
                <Label
                  key={r}
                  className="flex h-8 cursor-pointer items-center gap-2 rounded-sm px-2 text-[13px] font-normal hover:bg-muted"
                >
                  <RadioGroupItem value={r} />
                  {r}
                </Label>
              ))}
            </RadioGroup>
          ) : null}
          <Textarea
            autoFocus={mode === "note"}
            aria-label="Note"
            placeholder={
              mode === "note"
                ? 'e.g. "It is dock D, not B - and they open the door ahead of arrival if you call."'
                : "What should it have done? (optional)"
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-16 resize-none text-[13px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
              Cancel
            </Button>
            {mode === "note" ? (
              <Button
                size="sm"
                disabled={!note.trim()}
                onClick={() => {
                  toast.success("Note saved", { description: "The Operator will relearn from it." })
                  setMode(null)
                }}
              >
                Save note
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setRejected(true)
                  toast("Rejected", { description: `${reason}. Your team will see it in Teach.` })
                  setMode(null)
                }}
              >
                Reject
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Recording({ length }: { length?: string }) {
  const [playing, setPlaying] = React.useState(false)
  return (
    <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
      <button
        type="button"
        aria-label={playing ? "Pause recording" : "Play recording"}
        onClick={() => setPlaying((p) => !p)}
        className="grid size-8 flex-none place-items-center rounded-full bg-primary text-primary-foreground"
      >
        {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
      </button>
      <div className="flex flex-1 flex-col gap-1.5">
        <span className="text-[13px] font-medium">Call recording</span>
        <span className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <span className={cn("block h-full rounded-full bg-primary transition-all duration-[3000ms]", playing ? "w-1/3" : "w-0")} />
        </span>
      </div>
      <span className="text-[13px] text-muted-foreground">{length}</span>
    </div>
  )
}

export function ActivitySheet({
  row,
  tab,
  onTab,
  onClose,
}: {
  row: ActivityRow | undefined
  tab: SheetTab
  onTab: (t: SheetTab) => void
  onClose: () => void
}) {
  // Keep the last row while the sheet animates closed.
  const [last, setLast] = React.useState(row)
  if (row && row !== last) setLast(row)
  const r = row ?? last
  const agentId: AgentId = AGENTS.find((a) => a.name === r?.agent)?.id ?? "op"
  const callout = r && (r.status === "needs" || r.status === "fail" || r.status === "prog") ? CALLOUT[r.status] : null
  const inbox = r ? INBOX_LINK[r.id] ?? "/inbox" : "/inbox"

  return (
    <Sheet open={!!row} onOpenChange={(o) => (o ? null : onClose())}>
      <SheetContent
        className="w-full gap-0 p-0 sm:max-w-[560px]"
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {r ? (
          <>
            <SheetHeader className="gap-1.5 border-b px-5 py-4">
              <div className="flex items-start justify-between gap-2">
                <SheetTitle className="text-base font-medium">{r.about}</SheetTitle>
                <Button variant="ghost" size="icon-sm" aria-label="Close details" onClick={onClose} className="-mt-1 -mr-2">
                  <X />
                </Button>
              </div>
              <SheetDescription className="flex items-center gap-1.5 text-[13px]">
                <ChannelIcon channel={r.channel} />
                {r.from} · {r.when}
              </SheetDescription>
              <span className="flex items-center gap-2 text-[13px]">
                <ActivityStatusBadge status={r.status} />
                <span className="text-muted-foreground">{r.statusNote}</span>
              </span>
            </SheetHeader>

            <Tabs value={tab} onValueChange={(v) => onTab(v as SheetTab)} className="min-h-0 flex-1 gap-0">
              <div className="px-5 pt-3">
                <TabsList>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="convo">Conversation</TabsTrigger>
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                  <TabsTrigger value="agent">Agent</TabsTrigger>
                  <TabsTrigger value="canvas">Canvas</TabsTrigger>
                </TabsList>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <TabsContent value="summary" className="flex flex-col gap-4">
                  {callout ? (
                    <div className={cn("flex flex-col gap-2 rounded-lg border px-4 py-3.5", callout.cls)}>
                      <span className={cn("font-medium", callout.fg)}>{callout.title}</span>
                      <span className="text-sm">{r.ask}</span>
                      {r.cta ? (
                        <div>
                          <Button asChild size="sm">
                            <Link href={inbox}>{r.cta}</Link>
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] text-muted-foreground">What they asked</span>
                    <span className="text-sm">{r.asked}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] text-muted-foreground">What the Operator did</span>
                    <span className="text-sm">{r.did}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 rounded-lg border px-4 py-3.5">
                    <Field label="Customer">{r.customer}</Field>
                    <Field label="Channel">{r.channel}</Field>
                    <Field label="Request type">{r.type}</Field>
                    <Field label="Stage">
                      <StageBadge stage={r.stage} />
                    </Field>
                    <Field label="Reference">{r.ref}</Field>
                    <Field label="Agent">
                      <Link href={`/agents/${agentId}`} className="hover:underline">
                        {r.agent}
                      </Link>
                    </Field>
                    <Field label="Handled by">{r.by}</Field>
                  </div>
                  <Feedback key={r.id} />
                </TabsContent>

                <TabsContent value="convo" className="flex flex-col gap-3">
                  {r.lines ? (
                    <>
                      <Recording key={r.id} length={r.length} />
                      <div className="flex flex-col">
                        {r.lines.map((l, i) => (
                          <div key={i} className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 border-b py-2">
                            <span
                              className={cn(
                                "text-[13px] font-medium",
                                l.who === "The Operator" ? "text-blue-900 dark:text-blue-300" : "text-gray-700 dark:text-gray-300"
                              )}
                            >
                              {l.who}
                            </span>
                            <span className="text-sm">{l.text}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    (r.msgs ?? []).map((m, i) => {
                      const op = m.who === "The Operator"
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex flex-col gap-2.5 rounded-lg px-4 py-3.5",
                            m.draft
                              ? "border border-dashed border-amber-500 bg-amber-50 dark:bg-amber-950"
                              : "border"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={cn(
                                "grid size-7 flex-none place-items-center rounded-full text-[11px] font-semibold text-gray-700",
                                op ? "bg-sky-100" : AVATARS[i % AVATARS.length]
                              )}
                            >
                              {op ? "OP" : initials(m.who)}
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col leading-tight">
                              <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                                {m.who}
                                {m.draft ? <ToneBadge tone="amber">Draft, waiting for approval</ToneBadge> : null}
                              </span>
                              <span className="text-xs text-muted-foreground">{m.addr}</span>
                            </span>
                            <span className="whitespace-nowrap text-xs text-muted-foreground">{m.time}</span>
                          </div>
                          <div className="whitespace-pre-line text-sm leading-relaxed">{m.body}</div>
                          {m.draft ? (
                            <div className="flex gap-2">
                              <Button asChild size="sm">
                                <Link href={inbox}>Approve and send</Link>
                              </Button>
                              <Button asChild size="sm" variant="outline">
                                <Link href={inbox}>Edit reply</Link>
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      )
                    })
                  )}
                </TabsContent>

                <TabsContent value="steps" className="flex flex-col gap-4">
                  {r.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "grid size-6 flex-none place-items-center rounded-full border text-[11px]",
                          !s.mark && "text-muted-foreground",
                          s.mark === "ok" && "border-primary bg-primary text-primary-foreground",
                          s.mark === "bad" && "border-red-200 bg-red-100 text-red-800",
                          s.mark === "wait" && "border-amber-200 bg-amber-100 text-amber-800"
                        )}
                      >
                        {s.mark === "ok" ? (
                          <Check className="size-3" />
                        ) : s.mark === "bad" ? (
                          <X className="size-3" />
                        ) : s.mark === "wait" ? (
                          <Clock className="size-3" />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{s.title}</span>
                        <span className="text-[13px] text-muted-foreground">{s.sub}</span>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="agent">
                  <RunAgent row={r} agentId={agentId} />
                </TabsContent>

                <TabsContent value="canvas">
                  <RunCanvas row={r} agentId={agentId} />
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3.5">
              <Button asChild variant="outline" size="sm">
                <Link href={`/agents/${agentId}`}>
                  Open agent
                  <ExternalLink />
                </Link>
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-[13px] text-muted-foreground hover:text-foreground">
                    Debug info (admins)
                  </button>
                </TooltipTrigger>
                <TooltipContent>Raw logs for this run. Only admins can open it.</TooltipContent>
              </Tooltip>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
