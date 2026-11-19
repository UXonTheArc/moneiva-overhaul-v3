import Link from "next/link"
import { ArrowRight, ArrowUpRight, Brain, Workflow } from "lucide-react"

import { KindIcon } from "@/components/moneiva/agents/kind-icon"
import { PageHeader } from "@/components/moneiva/page-header"
import { STAGE_CLASS, StatusDot } from "@/components/moneiva/status"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LEARNING_AGENTS, TASK_AGENTS } from "@/lib/moneiva/agents-data"
import { requestTypesFor } from "@/lib/moneiva/agents-extra-data"
import { REQUEST_TYPES, RULES, STAGES, type Stage } from "@/lib/moneiva/data"
import { FACT_COUNT } from "@/lib/moneiva/playbook-data"

/** What happens at each step, worded for selling. */
export const STEP_DOES: Record<Stage, string> = {
  Learn: "Reads past email and documents. Nothing is sent.",
  Shadow: "Watches live work and guesses what your team will do.",
  Review: "Does the work. A person approves it first.",
  Autopilot: "Does it alone. Everything shows in Activity.",
}

const BAR: Record<Stage, string> = {
  Learn: "bg-zinc-300 dark:bg-zinc-600",
  Shadow: "bg-blue-500",
  Review: "bg-amber-500",
  Autopilot: "bg-green-600",
}

const countBy = (types: { stage: Stage }[]) => STAGES.map((s) => ({ stage: s, count: types.filter((t) => t.stage === s).length }))

/**
 * The Operator is the brain. It holds what your team taught it (Playbook) and decides how much it may do alone.
 * Its learning agents each work one channel and feed what they see back to it.
 * Task agents are not part of it: they follow a script and run inside workflows.
 */
export function OperatorOverview() {
  const ready = REQUEST_TYPES.filter((t) => t.flag === "ready")
  const toName = REQUEST_TYPES.filter((t) => t.flag === "name")
  const all = countBy(REQUEST_TYPES)

  return (
    <>
      <PageHeader
        leading={
          <span className="grid size-11 flex-none place-items-center rounded-xl bg-indigo-50 text-blue-800 dark:bg-indigo-950 dark:text-blue-200">
            <Brain className="size-[22px]" aria-hidden />
          </span>
        }
        title="The Operator"
        description="The brain behind your customer service desk. It learns how your team works through its learning agents, and each request type earns its way from Learn to Autopilot."
        actions={
          <>
            <Button asChild>
              <Link href="/teach">Teach it</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/playbook">Open Playbook</Link>
            </Button>
          </>
        }
      />

      {/* What it knows */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { n: FACT_COUNT, label: "facts it knows", sub: "From your documents and past email", href: "/teach?tab=documents" },
          { n: REQUEST_TYPES.length, label: "request types", sub: `${toName.length} new ones to name`, href: "/playbook" },
          { n: RULES.length, label: "rules your team set", sub: "Always followed, at every step", href: "/playbook?tab=rules" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="group">
            <Card className="gap-1 px-5 py-4 shadow-none transition-colors group-hover:bg-muted/40">
              <span className="text-[28px] font-semibold tracking-tight tabular-nums">{s.n}</span>
              <span className="text-sm font-medium">{s.label}</span>
              <span className="text-[13px] text-muted-foreground">{s.sub}</span>
            </Card>
          </Link>
        ))}
      </div>

      {/* The four steps */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-medium">How much it does on its own</h2>
          <span className="text-muted-foreground">Every request type moves through four steps. Your team decides when it moves up.</span>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {all.map(({ stage, count }, i) => (
            <Link key={stage} href={`/playbook?stage=${stage}`} className="group">
              <Card className="h-full gap-2 px-4 py-4 shadow-none transition-colors group-hover:bg-muted/40">
                <div className="flex items-center gap-2">
                  <span className={cn("grid size-6 place-items-center rounded-full border text-xs font-semibold", STAGE_CLASS[stage])}>{i + 1}</span>
                  <span className="font-medium">{stage}</span>
                  <span className="ml-auto text-[22px] font-semibold tabular-nums">{count}</span>
                </div>
                <span className="text-[13px] text-muted-foreground">{STEP_DOES[stage]}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Learning agents */}
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-medium">Learning agents</h2>
          <span className="text-muted-foreground">Each one works a channel for the Operator. What they see teaches it, and they follow its Playbook.</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {LEARNING_AGENTS.map((a) => {
            const types = requestTypesFor(a)
            const split = countBy(types)
            return (
              <Card key={a.id} className="gap-3 p-[18px]">
                <div className="flex items-start gap-3">
                  <KindIcon kind={a.kind} />
                  <span className="flex min-w-0 flex-1 flex-col leading-snug">
                    <Link href={a.href} className="text-[15px] font-semibold hover:underline">
                      {a.name}
                    </Link>
                    <span className="text-[13px] text-muted-foreground">{a.channel}</span>
                  </span>
                  <StatusDot status={a.status} className="pt-0.5 text-[13px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                    {split.map((s) =>
                      s.count ? <i key={s.stage} className={BAR[s.stage]} style={{ width: `${(s.count / types.length) * 100}%` }} /> : null
                    )}
                  </div>
                  <span className="text-[13px] text-muted-foreground">
                    {types.length} request types: {split.filter((s) => s.count).map((s) => `${s.count} in ${s.stage}`).join(", ")}
                  </span>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2.5 text-[13px]">
                  <span>
                    <span className="font-semibold">{a.today}</span>
                    <span className="text-muted-foreground"> {a.todayLabel}</span>
                  </span>
                  {a.needs ? (
                    <Link href={a.needsHref ?? "/inbox"} className="font-medium text-amber-800 hover:underline dark:text-amber-300">
                      {a.needs}
                    </Link>
                  ) : null}
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Ready to move up */}
      {ready.length ? (
        <section className="flex flex-col gap-3.5">
          <h2 className="text-lg font-medium">Ready to move up</h2>
          <Card className="gap-0 divide-y py-0 shadow-none">
            {ready.map((t) => (
              <Link key={t.name} href={`/playbook?type=${encodeURIComponent(t.name)}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40">
                <span className="grid size-8 flex-none place-items-center rounded-lg bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200">
                  <ArrowUpRight className="size-4" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-[13px] text-muted-foreground">
                    Matched your team {t.matched} of {t.of} times while shadowing. Move it to Review.
                  </span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
              </Link>
            ))}
          </Card>
        </section>
      ) : null}

      {/* Where task agents live */}
      <Card className="flex-row flex-wrap items-center gap-3 bg-muted/40 px-5 py-4 shadow-none">
        <Workflow className="size-5 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-[1_1_320px] text-[13px] text-muted-foreground">
          <span className="font-medium text-foreground">Not here: {TASK_AGENTS.map((a) => a.name).join(", ")}.</span> Task agents don&apos;t learn. They
          follow a script you set, and workflows decide when they run.
        </span>
        <Button asChild variant="ghost" size="sm">
          <Link href="/agents">Task agents</Link>
        </Button>
      </Card>
    </>
  )
}
