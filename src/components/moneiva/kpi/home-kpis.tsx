"use client"

import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useHydrated } from "@/lib/moneiva/use-hydrated"
import { allKpis, togglePin, useKpis } from "@/lib/moneiva/kpi-data"

import { KpiCard } from "./kpi-card"

/** The KPIs someone chose to keep on Home. Same small cards as Trends and KPIs. */
export function HomeKpis() {
  const store = useKpis()
  const hydrated = useHydrated()
  if (!hydrated) return null
  const all = allKpis(store)
  // In the order they were added to Home.
  const pinned = store.pinned.map((id) => all.find((k) => k.id === id)).filter((k) => k !== undefined)
  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-lg font-medium">Your KPIs</h2>
          <span className="text-muted-foreground">Last 7 days. Pick which charts show here from Trends and KPIs.</span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/trends">Trends and KPIs</Link>
        </Button>
      </div>
      {pinned.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {pinned.map((k) => (
            <KpiCard
              key={k.id}
              k={k}
              onPin={() => {
                togglePin(k.id)
                toast(`${k.title} removed from Home.`, { action: { label: "Undo", onClick: () => togglePin(k.id) } })
              }}
              pinned
              onHome
            />
          ))}
        </div>
      ) : (
        <Link href="/trends" className="rounded-xl border border-dashed px-5 py-6 text-center text-sm text-muted-foreground hover:bg-muted/40">
          No KPIs on Home yet. Add one from Trends and KPIs.
        </Link>
      )}
    </section>
  )
}
