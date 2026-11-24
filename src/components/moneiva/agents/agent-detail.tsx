"use client"

import { CircleAlert, Ellipsis, FlaskConical, Pencil } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { PageHeader } from "@/components/moneiva/page-header"
import { STATUS } from "@/components/moneiva/status"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { agentById, isLearning } from "@/lib/moneiva/agents-data"
import { AGENT_STATUS_OPTIONS, FLOWS, requestTypesFor, type AgentId } from "@/lib/moneiva/agents-extra-data"
import type { AgentStatus } from "@/lib/moneiva/data"

import { AgentTestSheet } from "./agent-test-sheet"
import { DataTab, FlowTab, ProfileTab, ToolsTab, TypesTab, type DraftStep, type StepEdits } from "./agent-tabs"
import { KindIcon } from "./kind-icon"
import { MenuItem, StatusMenu } from "./menus"
import { useQuery } from "./use-query"

const TABS = ["profile", "types", "flow", "tools", "data"] as const
type Tab = (typeof TABS)[number]

const NEW_STEP: Record<string, string> = {
  Agent: "Pick an agent",
  Check: "Add a condition",
  Approval: "Wait for approval",
  Action: "Pick an action",
  Record: "Log to Activity",
}

export function AgentDetail({ id }: { id: AgentId }) {
  const agent = agentById(id)!
  const q = useQuery()
  const rawTab = q.get("tab") as Tab | null
  const tab: Tab = rawTab && TABS.includes(rawTab) ? rawTab : "profile"
  const editing = tab === "flow" && q.get("edit") === "1"
  const testOpen = q.get("test") === "1"

  const [status, setStatus] = useState<AgentStatus>(agent.status)
  const [published, setPublished] = useState<DraftStep[]>(() => FLOWS[id].map((s, i) => ({ ...s, key: `s${i}` })))
  const [draft, setDraft] = useState<DraftStep[] | null>(null)
  const [publishedNote, setPublishedNote] = useState("Published Oct 2 by Jordan Lee")
  const typeCount = requestTypesFor(agent).length
  const learning = isLearning(agent)

  const goTab = (t: string) => q.set({ tab: t === "profile" ? null : t, edit: null })
  const startEdit = () => {
    if (!draft) setDraft(published)
    q.set({ tab: "flow", edit: "1" })
  }
  const newKey = useRef(0)
  const addStep = (index: number, kind: string) => {
    const step: DraftStep = { key: `n${++newKey.current}`, kind, title: NEW_STEP[kind] ?? "New step", sub: "New step. Set it up before you publish.", isNew: true }
    setDraft((d) => {
      const base = d ?? published
      return [...base.slice(0, index), step, ...base.slice(index)]
    })
    setSelected(step.key)
  }

  const [selected, setSelected] = useState<string | null>(null)
  const edit = (fn: (steps: DraftStep[]) => DraftStep[]) => setDraft((d) => fn(d ?? published))
  const edits: StepEdits = {
    selected,
    onSelect: setSelected,
    onChange: (key, patch) => {
      // Undo of a delete comes back through here with the step's old position in the key.
      if (key === "__restore__") {
        const [at, k] = String(patch.key).split("|")
        return edit((all) => [...all.slice(0, Number(at)), { ...(patch as DraftStep), key: k }, ...all.slice(Number(at))])
      }
      edit((all) => all.map((s) => (s.key === key ? { ...s, ...patch } : s)))
    },
    onDelete: (key) => {
      setSelected(null)
      edit((all) => all.filter((s) => s.key !== key))
    },
    onMove: (key, dir) =>
      edit((all) => {
        const i = all.findIndex((s) => s.key === key)
        const next = [...all]
        ;[next[i], next[i + dir]] = [next[i + dir], { ...next[i], changed: true }]
        return next
      }),
  }

  const flowNote = editing ? "Draft, not live yet" : draft ? "Draft saved, not live yet" : publishedNote

  return (
    <>
      <PageHeader
        crumbs={
          learning
            ? [{ label: "The Operator", href: "/operator" }, { label: "Learning agents", href: "/operator" }, { label: agent.name }]
            : [{ label: "Task agents", href: "/agents" }, { label: agent.name }]
        }
        leading={<KindIcon kind={agent.kind} size="lg" />}
        title={agent.name}
        description={`${learning ? "Learning agent for the Operator" : "Task agent"} · ${agent.channel} · works for ${agent.team}`}
        actions={
          <>
            <StatusMenu
              value={status}
              options={AGENT_STATUS_OPTIONS}
              onChange={(s) => {
                if (s !== status) toast.success(`${agent.name} is now ${STATUS[s].label}.`)
                setStatus(s)
              }}
            />
            <Button variant="outline" onClick={() => q.set({ test: "1" })}>
              <FlaskConical /> Test agent
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions" className="data-[state=open]:bg-accent">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[230px]">
                <MenuItem label="History" sub="Every change, who made it, and when" />
                <MenuItem label="Workflows that use it" onSelect={() => goTab("flow")} />
                <MenuItem label="Duplicate" />
                <DropdownMenuSeparator />
                <MenuItem label="Delete agent" sub="Its history stays in Activity" danger />
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {status === "error" && agent.error ? (
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <span className="inline-flex items-center gap-2">
            <CircleAlert className="size-4 flex-none" /> {agent.error}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              goTab("profile")
              setTimeout(() => document.getElementById(`${agent.id}-addr`)?.focus(), 50)
            }}
          >
            Pick another number
          </Button>
        </div>
      ) : null}

      <Tabs value={tab} onValueChange={goTab} className="gap-5 [contain:inline-size]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList className="max-w-full justify-start overflow-x-auto overflow-y-hidden scrollbar-none">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="types">
              Request types<span className="ml-1 rounded-md bg-muted px-1.5 text-xs leading-[18px] text-muted-foreground">{typeCount}</span>
            </TabsTrigger>
            <TabsTrigger value="flow">How it runs</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
          {tab !== "flow" ? (
            <span className="text-[13px] text-muted-foreground">Changes apply as soon as you save, even while it is live.</span>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[13px] text-muted-foreground">{flowNote}</span>
              {editing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setDraft(null)
                      setSelected(null)
                      q.set({ edit: null })
                      toast("Draft discarded. The live version is unchanged.")
                    }}
                  >
                    Discard draft
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      q.set({ edit: null })
                      toast.success("Draft saved. The live version keeps running until you publish.")
                    }}
                  >
                    Save draft
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (draft) setPublished(draft.map((s) => ({ ...s, isNew: false, changed: false })))
                      setSelected(null)
                      setDraft(null)
                      setPublishedNote("Published just now by Taylor Morgan")
                      q.set({ edit: null })
                      toast.success("Published. New runs use this version.")
                    }}
                  >
                    Publish
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={startEdit}>
                  <Pencil /> Edit canvas
                </Button>
              )}
            </div>
          )}
        </div>
        <TabsContent value="profile">
          <ProfileTab agent={agent} />
        </TabsContent>
        <TabsContent value="types">
          <TypesTab agent={agent} />
        </TabsContent>
        <TabsContent value="flow">
          <FlowTab agent={agent} steps={editing ? (draft ?? published) : published} editing={editing} onAdd={addStep} edits={edits} />
        </TabsContent>
        <TabsContent value="tools">
          <ToolsTab agent={agent} />
        </TabsContent>
        <TabsContent value="data">
          <DataTab agent={agent} />
        </TabsContent>
      </Tabs>

      <AgentTestSheet agent={agent} open={testOpen} onOpenChange={(o) => q.set({ test: o ? "1" : null })} />
    </>
  )
}
