import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Inbox } from "lucide-react"

import { Page, PageHeader } from "@/components/moneiva/page-header"
import { AgentStrip } from "@/components/moneiva/home/agent-strip"
import { PeriodMenu } from "@/components/moneiva/home/period-menu"
import { HomeKpis } from "@/components/moneiva/kpi/home-kpis"
import { Wins } from "@/components/moneiva/home/wins"
import { StageBoard, StageBoardFromParams } from "@/components/moneiva/home/stage-board"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <Page title="Home">
      <PageHeader
        title="Good morning, Taylor"
        description="What your agents did and what they need from your team."
        actions={<PeriodMenu />}
      />

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900 dark:bg-amber-950">
        <span className="grid size-9 place-items-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          <Inbox className="size-[18px]" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-0.5">
          <span className="font-semibold">8 things need you</span>
          <span className="text-amber-900 dark:text-amber-200">
            4 replies to approve · 1 call to return · 3 new request types to name · oldest waiting 5 days
          </span>
        </div>
        <Button asChild>
          <Link href="/inbox">
            Open Inbox
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <AgentStrip />

      <HomeKpis />

      <Wins />

      <section className="flex flex-col gap-3.5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-medium">Where the Operator is with each request type</h2>
            <span className="text-muted-foreground">
              Each card is one request type. It earns its way from Learn to Autopilot, and your team decides when it moves.
            </span>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/playbook">Open Playbook</Link>
          </Button>
        </div>
        <Suspense fallback={<StageBoard />}>
          <StageBoardFromParams />
        </Suspense>
        <span className="text-xs text-muted-foreground">
          Last 30 days: 159 emails read, 82 in Learn, 40 in Shadow and 37 in Review. Counting since Sep 16, 2026.
        </span>
      </section>
    </Page>
  )
}
