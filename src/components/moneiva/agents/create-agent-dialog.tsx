"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Check, FileText, Loader, Power } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { AgentKind } from "@/lib/moneiva/agents-data"
import { KINDS, PROFILE_OPTIONS, STEP_COLOR } from "@/lib/moneiva/agents-extra-data"
import { cn } from "@/lib/utils"

import { KindIcon } from "./kind-icon"

/**
 * Create a task agent, step by step: channel, a starting template, basics, its job, and how it starts.
 * Then it shows the agent being made and hands it back to the list, Off.
 */

export type CreatedAgent = {
  name: string
  kind: AgentKind
  team: string
  address: string
  desc: string
  start: string
  steps: { kind: string; title: string; sub: string }[]
  job: { who: string; goal: string; may: string; mayNot: string }
}

type Template = { name: string; sub: string; who: string; goal: string; may: string; mayNot: string; start: Start; schedule?: string }
type Start = "workflow" | "schedule" | "arrives"

const BLANK: Template = { name: "", sub: "Start from scratch", who: "", goal: "", may: "", mayNot: "", start: "workflow" }

const TEMPLATES: Record<AgentKind, Template[]> = {
  outbound: [
    { name: "Appointment booking", sub: "Calls receivers to book delivery appointments", who: "A friendly scheduler from the dispatch desk.", goal: "Book a delivery appointment and confirm the dock.", may: "Offer the open times from the load.", mayNot: "Agree to fees or change the delivery address.", start: "workflow" },
    { name: "Carrier check calls", sub: "Calls carriers about late loads for an ETA", who: "A polite caller from the carrier desk.", goal: "Get an updated ETA and the reason for the delay.", may: "Ask for the ETA and the driver's location.", mayNot: "Agree to rate changes or detention pay.", start: "schedule", schedule: "Weekdays at 9 AM and 2 PM" },
    { ...BLANK, name: "Blank outbound caller" },
  ],
  email: [
    { name: "POD chasing", sub: "Emails carriers for missing proofs of delivery", who: "A polite billing assistant.", goal: "Get the signed POD for each delivered load.", may: "Ask for the POD and resend the load details.", mayNot: "Dispute charges or promise payment dates.", start: "schedule", schedule: "Daily at 8 AM" },
    { name: "Billing questions", sub: "Answers invoice and payment questions", who: "A clear, patient billing assistant.", goal: "Answer invoice questions from what's in Acme.", may: "Resend invoices and explain charges.", mayNot: "Issue credits or change invoice amounts.", start: "arrives" },
    { ...BLANK, name: "Blank email agent", start: "arrives" },
  ],
  inbound: [
    { name: "After-hours line", sub: "Answers calls when the desk is closed", who: "A calm after-hours assistant.", goal: "Give load status and take a message for the morning.", may: "Look up loads and take messages.", mayNot: "Promise call back times.", start: "arrives" },
    { ...BLANK, name: "Blank phone line", start: "arrives" },
  ],
  files: [
    { name: "Rate confirmations", sub: "Reads rate cons and checks them against the load", who: "A careful reader of carrier paperwork.", goal: "Match each rate con to its load and flag differences.", may: "Attach the file to the load and note differences.", mayNot: "Change rates in Acme.", start: "arrives" },
    { ...BLANK, name: "Blank files agent", start: "arrives" },
  ],
}

const ADDRESS: Record<AgentKind, string[]> = {
  email: ["billing@example.test", "pod@example.test", "claims@example.test"],
  inbound: ["(555) 010-0250 (new number)", "(555) 010-0251 (new number)"],
  outbound: ["(555) 010-0250 (new number)", "(555) 010-0251 (new number)"],
  files: ["Rate cons folder", "Rates folder", "Catalog folder"],
}
const ADDRESS_LABEL: Record<AgentKind, string> = { email: "Inbox it works", inbound: "Phone number it answers", outbound: "Number it calls from", files: "Folder it watches" }
const ARRIVES: Record<AgentKind, string> = { email: "When an email arrives", inbound: "When someone calls", outbound: "When a load changes in Acme", files: "When a file lands in the folder" }
const SCHEDULES = ["Weekdays at 9 AM and 2 PM", "Daily at 8 AM", "Every hour, 7 AM to 6 PM", "Every 15 minutes"]
const ACTION: Record<AgentKind, string> = { email: "Send the reply", inbound: "Text a summary", outbound: "Update the load in Acme", files: "Update the record in Acme" }

const STEPS = ["Channel", "Start from", "Basics", "Its job", "How it starts"]

export function CreateAgentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (a: CreatedAgent) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">{open ? <Wizard onClose={() => onOpenChange(false)} onCreated={onCreated} /> : null}</DialogContent>
    </Dialog>
  )
}

function Wizard({ onClose, onCreated }: { onClose: () => void; onCreated?: (a: CreatedAgent) => void }) {
  const [step, setStep] = useState(0) // 0..4 form, 5 making, 6 done
  const [kind, setKind] = useState<AgentKind>("outbound")
  const [tpl, setTpl] = useState<Template>(TEMPLATES.outbound[0])
  const [name, setName] = useState(TEMPLATES.outbound[0].name)
  const [voice, setVoice] = useState(PROFILE_OPTIONS.voice[1])
  const [team, setTeam] = useState(PROFILE_OPTIONS.team[0])
  const [address, setAddress] = useState(ADDRESS.outbound[0])
  const [job, setJob] = useState(() => {
    const t = TEMPLATES.outbound[0]
    return { who: t.who, goal: t.goal, may: t.may, mayNot: t.mayNot }
  })
  const [start, setStart] = useState<Start>("workflow")
  const [schedule, setSchedule] = useState(SCHEDULES[0])
  const [made, setMade] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const pickKind = (k: AgentKind) => {
    setKind(k)
    setAddress(ADDRESS[k][0])
    pickTpl(TEMPLATES[k][0])
  }
  const pickTpl = (t: Template) => {
    setTpl(t)
    setName(t.who ? t.name : "")
    setJob({ who: t.who, goal: t.goal, may: t.may, mayNot: t.mayNot })
    setStart(t.start)
    if (t.schedule) setSchedule(t.schedule)
  }

  const isCall = kind === "inbound" || kind === "outbound"
  const startLine = start === "workflow" ? "Started by a workflow" : start === "schedule" ? schedule : ARRIVES[kind]
  const agentName = name.trim() || "New agent"
  const canvas = [
    { kind: "Starts when", title: startLine, sub: start === "workflow" ? "Add it to a workflow from Workflows" : address.replace(" (new number)", "") },
    { kind: "Agent", title: `${agentName} ${isCall ? "makes the call" : kind === "email" ? "writes the email" : "reads the file"}`, sub: job.goal || "Set its goal on Profile" },
    { kind: "Check", title: "Did it get what it needed?", sub: "Yes: go on. No: try again later, then send to Inbox." },
    { kind: "Approval", title: "Wait for approval while in Learn", sub: "Shows in Inbox until someone approves it" },
    { kind: "Action", title: ACTION[kind], sub: "With what it found" },
    { kind: "Record", title: "Log to Activity", sub: isCall ? "Recording, transcript and summary" : "What came in and what it did" },
  ]
  const tasks = [
    "Saving who it is and its job",
    kind === "email" ? `Connecting ${address}` : kind === "files" ? `Watching ${address}` : `Reserving ${address.replace(" (new number)", "")}`,
    `Drawing its canvas · ${canvas.length} steps`,
    "Setting every request type to Learn",
    "Turning it off until you're ready",
  ]

  const create = () => {
    setStep(5)
    setMade(0)
    tasks.forEach((_, i) => timers.current.push(setTimeout(() => setMade(i + 1), 650 * (i + 1))))
    timers.current.push(
      setTimeout(() => {
        setStep(6)
        onCreated?.({ name: agentName, kind, team, address: address.replace(" (new number)", ""), desc: job.goal || "Not set up yet.", start: startLine, steps: canvas, job })
      }, 650 * tasks.length + 500)
    )
  }

  const ready = step !== 2 || name.trim().length > 0

  if (step === 5)
    return (
      <>
        <DialogHeader>
          <DialogTitle>Creating {agentName}</DialogTitle>
          <DialogDescription>This takes a few seconds.</DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-3 py-2 text-sm">
          {tasks.map((t, i) => (
            <li key={t} className={cn("flex items-center gap-2.5", i > made && "text-muted-foreground")}>
              {i < made ? <Check className="size-4 text-green-600" /> : i === made ? <Loader className="size-4 animate-spin text-blue-600" /> : <span className="size-4 rounded-full border" />}
              {t}
            </li>
          ))}
        </ul>
      </>
    )

  if (step === 6)
    return (
      <>
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-full bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
            <Check className="size-5" />
          </span>
          <DialogTitle>{agentName} is ready</DialogTitle>
          <DialogDescription>
            It&apos;s <b>Off</b>, so nothing goes out yet. Test it, then turn it on from its card when you&apos;re ready.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 rounded-lg border bg-muted/30 p-3">
          <span className="text-xs font-medium text-muted-foreground">Its canvas</span>
          <ol className="flex flex-col gap-1">
            {canvas.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-[13px]">
                <span className="inline-grid size-[18px] flex-none place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: STEP_COLOR[c.kind] }}>
                  {i + 1}
                </span>
                <span className="w-20 flex-none text-xs text-muted-foreground">{c.kind}</span>
                <span className="truncate">{c.title}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>
            See it in Task agents <ArrowRight />
          </Button>
        </div>
      </>
    )

  return (
    <>
      <DialogHeader>
        <span className="text-xs font-medium text-muted-foreground">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </span>
        <DialogTitle>
          {["What will it work?", "Start from a template", "The basics", "What's its job?", "How does it start?"][step]}
        </DialogTitle>
        <DialogDescription>
          {
            [
              "Pick the channel. You can't change this later.",
              "A template fills in its job and canvas. You can change everything.",
              "Its name, the team it works for, and where it works.",
              "This is what it says and does. It reads like instructions to a new hire.",
              "Task agents run when a workflow hands them work, on a schedule, or when something arrives.",
            ][step]
          }
        </DialogDescription>
        <div className="mt-1 flex gap-1" aria-hidden>
          {STEPS.map((s, i) => (
            <span key={s} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-blue-600" : "bg-muted")} />
          ))}
        </div>
      </DialogHeader>

      {step === 0 ? (
        <div role="radiogroup" aria-label="Channel" className="grid grid-cols-2 gap-2.5">
          {KINDS.map((k) => (
            <button
              key={k.kind}
              type="button"
              role="radio"
              aria-checked={kind === k.kind}
              onClick={() => pickKind(k.kind)}
              className={cn(
                "flex flex-col gap-1.5 rounded-[10px] border bg-card p-3 text-left text-sm hover:bg-accent/50",
                kind === k.kind && "border-primary ring-[3px] ring-ring/40"
              )}
            >
              <KindIcon kind={k.kind} size="sm" />
              <span className="font-medium">{k.label}</span>
              <span className="text-xs leading-snug text-muted-foreground">{k.sub}</span>
            </button>
          ))}
        </div>
      ) : null}

      {step === 1 ? (
        <div role="radiogroup" aria-label="Template" className="flex flex-col gap-2">
          {TEMPLATES[kind].map((t) => (
            <button
              key={t.name}
              type="button"
              role="radio"
              aria-checked={tpl.name === t.name}
              onClick={() => pickTpl(t)}
              className={cn(
                "flex items-center gap-3 rounded-[10px] border bg-card px-3.5 py-3 text-left text-sm hover:bg-accent/50",
                tpl.name === t.name && "border-primary ring-[3px] ring-ring/40"
              )}
            >
              <FileText className="size-4 flex-none text-muted-foreground" />
              <span className="flex flex-col">
                <span className="font-medium">{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.sub}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-4">
          <Field id="na-name" label="Name">
            <Input id="na-name" autoFocus placeholder="For example, Appointment booking – Northwind" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="na-team" label="Works for">
              <Pick id="na-team" value={team} onChange={setTeam} options={PROFILE_OPTIONS.team} />
            </Field>
            <Field id="na-addr" label={ADDRESS_LABEL[kind]}>
              <Pick id="na-addr" value={address} onChange={setAddress} options={ADDRESS[kind]} />
            </Field>
          </div>
          {isCall ? (
            <Field id="na-voice" label="Voice">
              <Pick id="na-voice" value={voice} onChange={setVoice} options={PROFILE_OPTIONS.voice} />
            </Field>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              ["who", "Who it is", "A polite caller from the carrier desk."],
              ["goal", "Its goal", "Get an updated ETA."],
              ["may", "It may", "Ask for the driver's location."],
              ["mayNot", "It may not", "Agree to rate changes."],
            ] as const
          ).map(([k, label, ph]) => (
            <Field key={k} id={`na-${k}`} label={label}>
              <Textarea id={`na-${k}`} rows={3} placeholder={ph} value={job[k]} onChange={(e) => setJob((j) => ({ ...j, [k]: e.target.value }))} />
            </Field>
          ))}
        </div>
      ) : null}

      {step === 4 ? (
        <div role="radiogroup" aria-label="How it starts" className="flex flex-col gap-2">
          {(
            [
              ["workflow", "A workflow hands it work", "For example, a damage report starts a call. You pick the workflow after."],
              ["schedule", "On a schedule", "It looks for work at set times."],
              ["arrives", ARRIVES[kind], "It starts on its own."],
            ] as const
          ).map(([v, t, sub]) => (
            <div
              key={v}
              className={cn("flex flex-col gap-2 rounded-[10px] border bg-card px-3.5 py-3 text-sm", start === v && "border-primary ring-[3px] ring-ring/40")}
            >
              <button type="button" role="radio" aria-checked={start === v} onClick={() => setStart(v)} className="flex flex-col text-left">
                <span className="font-medium">{t}</span>
                <span className="text-xs text-muted-foreground">{sub}</span>
              </button>
              {v === "schedule" && start === "schedule" ? <Pick id="na-sched" value={schedule} onChange={setSchedule} options={SCHEDULES} /> : null}
            </div>
          ))}
          <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Power className="size-3.5" /> New agents start Off, with every request type in Learn.
          </span>
        </div>
      ) : null}

      <div className="flex justify-between gap-2">
        {step === 0 ? (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft /> Back
          </Button>
        )}
        {step < 4 ? (
          <Button disabled={!ready} onClick={() => setStep((s) => s + 1)}>
            Continue <ArrowRight />
          </Button>
        ) : (
          <Button onClick={create}>Create agent</Button>
        )}
      </div>
    </>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}

function Pick({ id, value, onChange, options }: { id: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
