"use client"

import { useState } from "react"
import { Download, Plus } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/moneiva/page-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useHydrated } from "@/lib/moneiva/use-hydrated"
import { SOURCES, addKpi, allKpis, removeKpi, togglePin, useKpis, type ChartKind, type Kpi, type Range } from "@/lib/moneiva/kpi-data"

import { KpiCard } from "./kpi-card"

const RANGES: Range[] = ["24H", "7D", "30D", "90D"]

export function TrendsView() {
  const store = useKpis()
  const hydrated = useHydrated()
  const [range, setRange] = useState<Range>("7D")
  const [agent, setAgent] = useState("any")
  const [adding, setAdding] = useState(false)
  const list = allKpis(store).filter((k) => agent === "any" || k.agentId === agent)
  const onHome = store.pinned.length

  return (
    <>
      <PageHeader
        title="Trends and KPIs"
        description="Small charts built from what your agents collect. Each one shows where its data comes from. Add any of them to Home."
        actions={
          <>
            <Button variant="outline" onClick={() => toast("Mockup: downloads a CSV of every chart's data.")}>
              <Download /> Download CSV
            </Button>
            <Button onClick={() => setAdding(true)}>
              <Plus /> Add chart
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border p-0.5" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
              className={cn("rounded-md px-2.5 py-1 text-[13px]", range === r ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
            >
              {r}
            </button>
          ))}
        </div>
        <Select value={agent} onValueChange={setAgent}>
          <SelectTrigger className="w-52" aria-label="Agent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">All agents</SelectItem>
            {SOURCES.filter((s) => s.agentId !== "all").map((s) => (
              <SelectItem key={s.agentId} value={s.agentId}>
                {s.agentName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto text-[13px] text-muted-foreground">
          {hydrated ? `${onHome} on Home` : null}
          {range !== "7D" ? " · Mockup shows 7 days for every range" : null}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((k) => (
          <KpiCard
            key={k.id}
            k={k}
            pinned={hydrated && store.pinned.includes(k.id)}
            onPin={() => {
              const was = store.pinned.includes(k.id)
              togglePin(k.id)
              toast.success(was ? `${k.title} removed from Home.` : `${k.title} added to Home.`)
            }}
            onRemove={store.added.some((a) => a.id === k.id) ? () => removeKpi(k.id) : undefined}
          />
        ))}
      </div>

      <AddChart open={adding} onOpenChange={setAdding} />
    </>
  )
}

const KIND_LABEL: Record<ChartKind, string> = { stat: "Number", line: "Line", bars: "Bars", breakdown: "Breakdown" }
const KIND_SUB: Record<ChartKind, string> = {
  stat: "One number and its trend",
  line: "How it changes day to day",
  bars: "A count for each day",
  breakdown: "Split into its answers",
}

function AddChart({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [agentId, setAgentId] = useState("check")
  const src = SOURCES.find((s) => s.agentId === agentId)!
  const [field, setField] = useState(src.fields[0])
  const [kind, setKind] = useState<ChartKind>("bars")
  const [home, setHome] = useState(true)

  const preview: Kpi = {
    id: "preview",
    title: field === "ETA" ? "ETAs collected" : field,
    kind,
    agentId,
    agentName: src.agentName,
    field,
    from: { op: "Your connected inboxes", phone: "Inbound calls", check: "Outbound calls about late loads", osd: "Calls to delivery sites", all: "Every run" }[agentId] ?? "",
    value: kind === "breakdown" ? "52" : "96",
    delta: kind === "breakdown" ? undefined : { text: "new chart", good: true },
    points: [9, 18, 14, 4, 3, 22, 26],
    parts: [
      { label: "Answer A", value: 24 },
      { label: "Answer B", value: 17 },
      { label: "Answer C", value: 11 },
    ],
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Add a chart</DialogTitle>
          <DialogDescription>Pick the agent and the field it collects. The chart keeps a link back to where the data comes from.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kc-agent">Data from</Label>
              <Select
                value={agentId}
                onValueChange={(v) => {
                  setAgentId(v)
                  setField(SOURCES.find((s) => s.agentId === v)!.fields[0])
                }}
              >
                <SelectTrigger id="kc-agent" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s.agentId} value={s.agentId}>
                      {s.agentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="kc-field">What to chart</Label>
              <Select value={field} onValueChange={setField}>
                <SelectTrigger id="kc-field" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {src.fields.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">Fields come from each agent&apos;s Data tab.</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Show it as</span>
              <div role="radiogroup" className="grid grid-cols-2 gap-2">
                {(Object.keys(KIND_LABEL) as ChartKind[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={kind === c}
                    onClick={() => setKind(c)}
                    className={cn("flex flex-col rounded-lg border px-3 py-2 text-left text-sm hover:bg-accent/50", kind === c && "border-primary ring-[3px] ring-ring/40")}
                  >
                    <span className="font-medium">{KIND_LABEL[c]}</span>
                    <span className="text-xs text-muted-foreground">{KIND_SUB[c]}</span>
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-sm">
              <span className="flex flex-col">
                <span className="font-medium">Also add to Home</span>
                <span className="text-xs text-muted-foreground">It sits with your other KPIs at the top of Home.</span>
              </span>
              <Switch checked={home} onCheckedChange={setHome} />
            </label>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Preview</span>
            <KpiCard k={preview} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              addKpi({ ...preview, id: `k${Date.now().toString(36)}`, delta: undefined }, home)
              onOpenChange(false)
              toast.success(home ? `${preview.title} added here and to Home.` : `${preview.title} added.`)
            }}
          >
            Add chart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
