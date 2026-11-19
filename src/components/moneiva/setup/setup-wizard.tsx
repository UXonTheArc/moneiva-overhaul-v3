"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Brain,
  Building2,
  Check,
  FileText,
  Loader,
  Mail,
  Phone,
  Plug,
  Plus,
  Sparkles,
  Upload,
  Users,
  Workflow,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ScopePicker } from "@/components/moneiva/teach/sources"
import { FLOWS } from "@/lib/moneiva/agents-extra-data"
import { REQUEST_TYPES } from "@/lib/moneiva/data"
import { SCOPE_LABEL, type ReadScope } from "@/lib/moneiva/inbox-sources-data"

/**
 * First-run setup. Six short steps, then the Operator builds itself in front of the customer:
 * connecting each inbox creates a learning agent and the workflow it runs, and they can open both at the end.
 */

const STEPS = [
  { key: "business", label: "Your business", icon: Building2 },
  { key: "team", label: "Your team", icon: Users },
  { key: "email", label: "Email", icon: Mail },
  { key: "systems", label: "Phone and systems", icon: Plug },
  { key: "docs", label: "Documents", icon: FileText },
  { key: "review", label: "Review", icon: Check },
] as const

type Inbox = { address: string; provider: "Gmail" | "Microsoft 365"; scope: ReadScope; range: string; folders: string[] }
type Invite = { email: string; role: string }

const SAMPLE_INBOXES = ["service@example.test", "billing@example.test", "claims@example.test", "dispatch@example.test"]
const SAMPLE_DOCS = [
  { name: "Customer service handbook.docx", size: "1.2 MB" },
  { name: "Acme rate and accessorial sheet.pdf", size: "340 KB" },
  { name: "Dock hours and addresses.xlsx", size: "88 KB" },
]

export function SetupWizard() {
  const [step, setStep] = useState(-1) // -1 welcome, 0..5 steps, 6 building, 7 done
  const [biz, setBiz] = useState({ name: "Acme Logistics", website: "acme.example.test", industry: "LTL freight", tz: "Central time (Chicago)", hours: "Weekdays, 7 AM to 6 PM", sign: "Customer Service Team" })
  const [invites, setInvites] = useState<Invite[]>([
    { email: "jordan@example.test", role: "Admin" },
    { email: "sam@example.test", role: "Team member" },
  ])
  const [inboxes, setInboxes] = useState<Inbox[]>([])
  const [connecting, setConnecting] = useState<Inbox["provider"] | null>(null)
  const [openInbox, setOpenInbox] = useState(0)
  const [phone, setPhone] = useState(true)
  const [texts, setTexts] = useState(true)
  const [tms, setTms] = useState(false)
  const [docs, setDocs] = useState<string[]>([])

  const next = () => setStep((s) => s + 1)
  const back = () => setStep((s) => s - 1)

  const connect = (provider: Inbox["provider"]) => {
    setConnecting(provider)
    setTimeout(() => {
      setInboxes((all) => {
        const address = SAMPLE_INBOXES.find((a) => !all.some((i) => i.address === a)) ?? `team${all.length}@example.test`
        setOpenInbox(all.length)
        return [...all, { address, provider, scope: "all", range: "Last 6 months", folders: ["Inbox", "Customer service"] }]
      })
      setConnecting(null)
    }, 1100)
  }
  const patchInbox = (i: number, p: Partial<Inbox>) => setInboxes((all) => all.map((x, k) => (k === i ? { ...x, ...p } : x)))

  if (step === 6) return <Building inboxes={inboxes} phone={phone} docs={docs.length} tms={tms} onDone={next} />
  if (step === 7) return <Done inboxes={inboxes} phone={phone} docs={docs.length} invites={invites.length} biz={biz.name} />

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <TopStrip />
      {step === -1 ? (
        <Welcome onStart={next} />
      ) : (
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:gap-10 md:px-6 md:py-10">
          <Rail step={step} onGo={(i) => i < step && setStep(i)} />
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {step === 0 ? (
              <Panel title="Tell us about your business" sub="The Operator uses this to sign emails, keep business hours and sound like your team.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Company name" id="biz-name">
                    <Input id="biz-name" value={biz.name} onChange={(e) => setBiz({ ...biz, name: e.target.value })} />
                  </Field>
                  <Field label="Website" id="biz-web">
                    <Input id="biz-web" value={biz.website} onChange={(e) => setBiz({ ...biz, website: e.target.value })} />
                  </Field>
                  <Field label="What you do" id="biz-ind">
                    <Pick id="biz-ind" value={biz.industry} onChange={(v) => setBiz({ ...biz, industry: v })} options={["LTL freight", "Truckload", "Freight brokerage", "Warehousing", "Last mile delivery"]} />
                  </Field>
                  <Field label="Time zone" id="biz-tz">
                    <Pick id="biz-tz" value={biz.tz} onChange={(v) => setBiz({ ...biz, tz: v })} options={["Central time (Chicago)", "Eastern time (New York)", "Mountain time (Denver)", "Pacific time (Los Angeles)"]} />
                  </Field>
                  <Field label="Business hours" id="biz-hours" hint="Outside these hours it takes messages instead of promising same-day answers.">
                    <Pick id="biz-hours" value={biz.hours} onChange={(v) => setBiz({ ...biz, hours: v })} options={["Weekdays, 7 AM to 6 PM", "Weekdays, 8 AM to 5 PM", "Every day, 24 hours"]} />
                  </Field>
                  <Field label="Sign emails as" id="biz-sign">
                    <Input id="biz-sign" value={biz.sign} onChange={(e) => setBiz({ ...biz, sign: e.target.value })} />
                  </Field>
                </div>
              </Panel>
            ) : null}

            {step === 1 ? (
              <Panel title="Invite your team" sub="They check the Operator's work and approve replies while it learns. You can invite more later.">
                <div className="flex flex-col gap-2">
                  {invites.map((inv, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        aria-label="Email"
                        placeholder="name@company.com"
                        value={inv.email}
                        onChange={(e) => setInvites(invites.map((x, k) => (k === i ? { ...x, email: e.target.value } : x)))}
                      />
                      <Pick
                        id={`role-${i}`}
                        className="w-40 flex-none"
                        value={inv.role}
                        onChange={(v) => setInvites(invites.map((x, k) => (k === i ? { ...x, role: v } : x)))}
                        options={["Admin", "Team member", "View only"]}
                      />
                      <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => setInvites(invites.filter((_, k) => k !== i))}>
                        <X />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="self-start" onClick={() => setInvites([...invites, { email: "", role: "Team member" }])}>
                    <Plus /> Add someone
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2 rounded-lg bg-muted/50 p-3.5 text-[13px] text-muted-foreground sm:grid-cols-3">
                  <span><b className="font-medium text-foreground">Admin:</b> everything, including setup and billing.</span>
                  <span><b className="font-medium text-foreground">Team member:</b> approves replies and teaches the Operator.</span>
                  <span><b className="font-medium text-foreground">View only:</b> sees Activity and reports.</span>
                </div>
              </Panel>
            ) : null}

            {step === 2 ? (
              <Panel
                title="Connect your team's email"
                sub="Connecting email creates a learning agent that reads your inboxes for the Operator. Pick what it reads from each one. Nothing is sent until your team says so."
              >
                <div className="flex flex-col gap-3">
                  {inboxes.map((ib, i) => (
                    <Card key={ib.address} className={cn("gap-0 py-0 shadow-none", openInbox === i && "ring-1 ring-blue-600")}>
                      <button type="button" onClick={() => setOpenInbox(i)} className="flex items-center gap-3 px-4 py-3 text-left">
                        <span className="grid size-9 flex-none place-items-center rounded-lg bg-indigo-50 text-blue-800 dark:bg-indigo-950 dark:text-blue-200">
                          <Mail className="size-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="font-medium">{ib.address}</span>
                          <span className="text-[13px] text-muted-foreground">
                            {ib.provider} · {SCOPE_LABEL[ib.scope]}
                            {ib.scope === "all" ? `, ${ib.range.toLowerCase()}` : ib.scope === "folders" ? `, ${ib.folders.length} folders` : ""}
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[13px] text-green-700 dark:text-green-400">
                          <Check className="size-3.5" /> Connected
                        </span>
                      </button>
                      {openInbox === i ? (
                        <div className="flex flex-col gap-2 border-t px-4 py-4 text-sm">
                          <span className="font-medium">What should it read?</span>
                          <ScopePicker
                            idPrefix={`setup-${i}`}
                            scope={ib.scope}
                            setScope={(s) => patchInbox(i, { scope: s })}
                            range={ib.range}
                            setRange={(r) => patchInbox(i, { range: r })}
                            folders={ib.folders}
                            setFolders={(f) => patchInbox(i, { folders: f })}
                          />
                        </div>
                      ) : null}
                    </Card>
                  ))}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {(["Gmail", "Microsoft 365"] as const).map((p) => (
                      <Button key={p} variant="outline" className="h-12 justify-start gap-3" disabled={!!connecting} onClick={() => connect(p)}>
                        {connecting === p ? <Loader className="animate-spin" /> : <Mail />}
                        {connecting === p ? "Signing in" : inboxes.length ? `Add another ${p} inbox` : `Connect ${p}`}
                      </Button>
                    ))}
                  </div>
                  {inboxes.length > 1 ? (
                    <span className="text-[13px] text-muted-foreground">
                      All {inboxes.length} inboxes will be answered by one agent, Email and texts. You can split a desk off into its own agent later.
                    </span>
                  ) : null}
                </div>
              </Panel>
            ) : null}

            {step === 3 ? (
              <Panel title="Phone and systems" sub="Optional. Each phone line also gets its own learning agent.">
                <Toggle
                  icon={<Phone />}
                  title="Answer your customer service line"
                  sub="(555) 010-0345 · gives pickup and delivery status, and books call backs"
                  on={phone}
                  set={setPhone}
                  makes="Creates the Inbound phone line agent"
                />
                <Toggle icon={<Mail />} title="Text messages" sub="Reply to texts sent to the same number" on={texts} set={setTexts} />
                <Toggle
                  icon={<Plug />}
                  title="Connect your TMS"
                  sub="Lets it look up pickups, PROs and delivery dates in Acme. Without it, it can only learn, not answer."
                  on={tms}
                  set={setTms}
                  makes="Adds Acme lookups to every agent"
                />
              </Panel>
            ) : null}

            {step === 4 ? (
              <Panel title="Add documents" sub="Handbooks, rate sheets and dock hours. It lists every fact it learns so your team can check them. You can add more later in Teach.">
                <button
                  type="button"
                  onClick={() => setDocs(SAMPLE_DOCS.map((d) => d.name))}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed bg-background px-4 py-8 text-center hover:bg-muted/40"
                >
                  <Upload className="size-5 text-muted-foreground" />
                  <span className="font-medium">Drop files here or click to upload</span>
                  <span className="text-[13px] text-muted-foreground">PDF, Word, Excel or plain text</span>
                </button>
                {docs.length ? (
                  <ul className="flex flex-col divide-y rounded-lg border bg-background">
                    {SAMPLE_DOCS.filter((d) => docs.includes(d.name)).map((d) => (
                      <li key={d.name} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                        <FileText className="size-4 text-muted-foreground" />
                        <span className="flex-1">{d.name}</span>
                        <span className="text-xs text-muted-foreground">{d.size}</span>
                        <Button variant="ghost" size="icon-sm" aria-label={`Remove ${d.name}`} onClick={() => setDocs(docs.filter((x) => x !== d.name))}>
                          <X />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Panel>
            ) : null}

            {step === 5 ? (
              <Panel title="Ready to build your Operator" sub="Here's what it will set up. Everything starts at Learn, so nothing is sent to a customer.">
                <ul className="flex flex-col divide-y rounded-lg border bg-background text-sm">
                  <Summary label="Business" value={`${biz.name} · ${biz.hours}`} onEdit={() => setStep(0)} />
                  <Summary label="Team" value={invites.length ? `${invites.length} invites` : "Just you for now"} onEdit={() => setStep(1)} />
                  <Summary
                    label="Email"
                    value={inboxes.map((i) => `${i.address} (${SCOPE_LABEL[i.scope].toLowerCase()})`).join(", ") || "None yet"}
                    onEdit={() => setStep(2)}
                  />
                  <Summary label="Phone and systems" value={[phone && "Phone line", texts && "Texts", tms && "Acme TMS"].filter(Boolean).join(", ") || "None"} onEdit={() => setStep(3)} />
                  <Summary label="Documents" value={docs.length ? `${docs.length} files` : "None yet"} onEdit={() => setStep(4)} />
                </ul>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Creates icon={<Bot />} title={`${1 + (phone ? 1 : 0)} learning ${phone ? "agents" : "agent"}`} sub={["Email and texts", phone && "Inbound phone line"].filter(Boolean).join(" and ")} />
                  <Creates icon={<Workflow />} title={`${1 + (phone ? 1 : 0)} ${phone ? "workflows" : "workflow"}`} sub="How each agent handles what comes in. You can open and change them." />
                </div>
              </Panel>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={back}>
                <ArrowLeft /> Back
              </Button>
              <div className="flex items-center gap-2">
                {step === 1 || step === 3 || step === 4 ? (
                  <Button variant="ghost" onClick={next}>
                    Skip for now
                  </Button>
                ) : null}
                <Button onClick={next} disabled={step === 2 && inboxes.length === 0}>
                  {step === 5 ? (
                    <>
                      <Sparkles /> Build my Operator
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TopStrip() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
      <Image src="/moneiva-logo.png" alt="Moneiva" width={112} height={20} className="h-[18px] w-auto" priority />
      <Link href="/" className="text-[13px] text-muted-foreground hover:text-foreground">
        Finish later
      </Link>
    </header>
  )
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-8 px-4 pt-12 pb-12 text-center md:pt-20">
      <span className="grid size-14 place-items-center rounded-2xl bg-indigo-50 text-blue-800 dark:bg-indigo-950 dark:text-blue-200">
        <Brain className="size-7" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to Moneiva</h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Let&apos;s set up your Operator. It learns how your team works from your email and documents, then takes on more of the work as
          your team approves it. Setup takes about 10 minutes.
        </p>
      </div>
      <ol className="grid w-full grid-cols-2 gap-3 text-left sm:grid-cols-4">
        {[
          ["Learn", "Reads your past email and documents"],
          ["Shadow", "Watches live work and guesses"],
          ["Review", "Does the work, a person approves"],
          ["Autopilot", "Does it alone, all in Activity"],
        ].map(([t, s], i) => (
          <li key={t} className="flex flex-col gap-1 rounded-xl border bg-background p-3.5">
            <span className="grid size-6 place-items-center rounded-full bg-muted text-xs font-medium">{i + 1}</span>
            <span className="font-medium">{t}</span>
            <span className="text-[13px] text-muted-foreground">{s}</span>
          </li>
        ))}
      </ol>
      <Button size="lg" onClick={onStart}>
        Get started <ArrowRight />
      </Button>
    </div>
  )
}

function Rail({ step, onGo }: { step: number; onGo: (i: number) => void }) {
  return (
    <nav aria-label="Setup steps" className="md:w-52 md:flex-none">
      <ol className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5">
        {STEPS.map((s, i) => {
          const done = i < step
          const on = i === step
          return (
            <li key={s.key} className="flex-none">
              <button
                type="button"
                onClick={() => onGo(i)}
                disabled={!done}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm",
                  on && "bg-background font-medium shadow-sm",
                  !on && !done && "text-muted-foreground",
                  done && "hover:bg-background/60"
                )}
              >
                <span
                  className={cn(
                    "grid size-6 flex-none place-items-center rounded-full border text-xs",
                    done && "border-green-600 bg-green-600 text-white",
                    on && "border-blue-600 text-blue-700 dark:text-blue-300"
                  )}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className="whitespace-nowrap">{s.label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function Panel({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <Card className="gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{sub}</p>
      </div>
      {children}
    </Card>
  )
}

function Field({ label, id, hint, children }: { label: string; id: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

function Pick({ id, value, onChange, options, className }: { id: string; value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className={cn("w-full", className)}>
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

function Toggle({ icon, title, sub, on, set, makes }: { icon: React.ReactNode; title: string; sub: string; on: boolean; set: (v: boolean) => void; makes?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background px-4 py-3.5">
      <span className="grid size-9 flex-none place-items-center rounded-lg bg-muted text-muted-foreground [&>svg]:size-4">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-medium">{title}</span>
        <span className="text-[13px] text-muted-foreground">{sub}</span>
        {makes && on ? <span className="mt-1 text-xs font-medium text-blue-700 dark:text-blue-300">{makes}</span> : null}
      </span>
      <Switch checked={on} onCheckedChange={set} />
    </label>
  )
}

function Summary({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span className="w-36 flex-none text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1">{value}</span>
      <button type="button" onClick={onEdit} className="text-[13px] text-blue-600 hover:underline dark:text-blue-400">
        Edit
      </button>
    </li>
  )
}

function Creates({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-blue-50/60 px-4 py-3 dark:bg-blue-950/40">
      <span className="mt-0.5 text-blue-700 dark:text-blue-300 [&>svg]:size-4">{icon}</span>
      <span className="flex flex-col gap-0.5">
        <span className="font-medium">{title}</span>
        <span className="text-[13px] text-muted-foreground">{sub}</span>
      </span>
    </div>
  )
}

// ---------------- Building: show the agent and workflow being made ----------------

type Task = { id: string; label: string; detail: string }

function Building({ inboxes, phone, docs, tms, onDone }: { inboxes: Inbox[]; phone: boolean; docs: number; tms: boolean; onDone: () => void }) {
  const tasks: Task[] = [
    ...inboxes.map((i) => ({ id: `c-${i.address}`, label: `Connecting ${i.address}`, detail: i.provider })),
    { id: "agent", label: "Creating the Email and texts agent", detail: "A learning agent that reads your inboxes for the Operator" },
    { id: "flow", label: "Drawing its workflow", detail: "What happens when a new email comes in" },
    ...(phone ? [{ id: "phone", label: "Creating the Inbound phone line agent", detail: "Answers (555) 010-0345, with its own workflow" }] : []),
    { id: "read", label: "Reading your email", detail: inboxes.map((i) => SCOPE_LABEL[i.scope].toLowerCase()).join(", ") },
    { id: "types", label: "Finding your kinds of request", detail: "Grouping what customers ask for" },
    ...(docs ? [{ id: "docs", label: `Reading ${docs} documents`, detail: "Listing every fact it learns" }] : []),
    ...(tms ? [{ id: "tms", label: "Linking Acme lookups", detail: "Pickups, PROs and delivery dates" }] : []),
    { id: "learn", label: "Putting everything at Learn", detail: "Nothing is sent until your team says so" },
  ]
  const [done, setDone] = useState(0)
  useEffect(() => {
    if (done >= tasks.length) {
      const t = setTimeout(onDone, 1400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setDone((d) => d + 1), done === 0 ? 700 : 1100)
    return () => clearTimeout(t)
  }, [done, tasks.length, onDone])

  const has = (id: string) => tasks.findIndex((t) => t.id === id) < done
  const at = (id: string) => tasks.findIndex((t) => t.id === id) === done
  const flow = FLOWS.op
  const flowShown = has("flow") ? flow.length : at("flow") ? 2 : 0
  const types = REQUEST_TYPES.filter((t) => t.flag !== "name").slice(0, 10)
  const typesShown = has("types") ? types.length : at("types") ? 4 : 0
  const threads = has("read") ? 1240 : at("read") ? 472 : 0

  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <TopStrip />
      <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-6 px-4 py-8 md:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:py-12">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Building your Operator</h1>
            <p className="text-muted-foreground">This takes a few minutes. You can watch it, or leave and we&apos;ll email you.</p>
          </div>
          <ol className="flex flex-col gap-1">
            {tasks.map((t, i) => {
              const state = i < done ? "done" : i === done ? "now" : "todo"
              return (
                <li key={t.id} className={cn("flex items-start gap-3 rounded-lg px-2.5 py-2", state === "now" && "bg-background shadow-sm")}>
                  <span
                    className={cn(
                      "mt-0.5 grid size-5 flex-none place-items-center rounded-full border",
                      state === "done" && "border-green-600 bg-green-600 text-white",
                      state === "now" && "border-blue-600 text-blue-600"
                    )}
                  >
                    {state === "done" ? <Check className="size-3" /> : state === "now" ? <Loader className="size-3 animate-spin" /> : null}
                  </span>
                  <span className={cn("flex flex-col", state === "todo" && "text-muted-foreground")}>
                    <span className="text-sm font-medium">{t.label}</span>
                    <span className="text-xs text-muted-foreground">{t.detail}</span>
                  </span>
                </li>
              )
            })}
          </ol>
          <button type="button" onClick={onDone} className="self-start text-[13px] text-muted-foreground hover:text-foreground">
            Skip ahead
          </button>
        </div>

        {/* What's being made, as it's made. */}
        <Card className="gap-5 p-5 md:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-blue-800 dark:bg-indigo-950 dark:text-blue-200">
              <Brain className="size-5" />
            </span>
            <div className="flex flex-col">
              <span className="font-semibold">The Operator</span>
              <span className="text-[13px] text-muted-foreground">
                {threads ? `${threads.toLocaleString()} threads read` : "Waiting for email"} · {typesShown} request types · {has("docs") ? "48 facts" : "0 facts"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <MadeAgent
              show={has("agent") || at("agent")}
              ready={has("agent")}
              icon={<Mail />}
              name="Email and texts"
              sub={inboxes.map((i) => i.address).join(", ")}
            />
            {phone ? <MadeAgent show={has("phone") || at("phone")} ready={has("phone")} icon={<Phone />} name="Inbound phone line" sub="(555) 010-0345" /> : null}
          </div>

          <div className={cn("flex flex-col gap-2 transition-opacity duration-500", flowShown ? "opacity-100" : "opacity-30")}>
            <span className="flex items-center gap-2 text-sm font-medium">
              <Workflow className="size-4 text-muted-foreground" /> Workflow · Answer customer email
            </span>
            <ol className="flex flex-col items-start gap-0">
              {flow.map((s, i) => (
                <li
                  key={s.title}
                  className={cn("flex flex-col items-start transition-all duration-500", i < flowShown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0")}
                >
                  {i > 0 ? <span aria-hidden className="ml-4 h-3 w-px bg-border" /> : null}
                  <span className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-[13px]">
                    <span className="text-xs text-muted-foreground">{s.kind}</span>
                    <span className="font-medium">{s.title}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className={cn("flex flex-col gap-2 transition-opacity duration-500", typesShown ? "opacity-100" : "opacity-30")}>
            <span className="text-sm font-medium">Kinds of request it found</span>
            <div className="flex flex-wrap gap-1.5">
              {types.slice(0, typesShown).map((t) => (
                <span key={t.name} className="rounded-md border bg-muted/50 px-2 py-0.5 text-xs">
                  {t.name}
                </span>
              ))}
              {!typesShown ? <span className="text-xs text-muted-foreground">Starts after it reads your email</span> : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function MadeAgent({ show, ready, icon, name, sub }: { show: boolean; ready: boolean; icon: React.ReactNode; name: string; sub: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-500",
        show ? "opacity-100" : "border-dashed opacity-40",
        ready && "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30"
      )}
    >
      <span className="grid size-9 flex-none place-items-center rounded-lg bg-indigo-50 text-blue-800 dark:bg-indigo-950 dark:text-blue-200 [&>svg]:size-4">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium">{name}</span>
        <span className="truncate text-xs text-muted-foreground">{sub}</span>
        <span className="mt-1 text-xs">
          {ready ? (
            <span className="text-green-700 dark:text-green-400">Agent created · Learn</span>
          ) : show ? (
            <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300">
              <Loader className="size-3 animate-spin" /> Creating
            </span>
          ) : (
            <span className="text-muted-foreground">Next</span>
          )}
        </span>
      </span>
    </div>
  )
}

// ---------------- Done ----------------

function Done({ inboxes, phone, docs, invites, biz }: { inboxes: Inbox[]; phone: boolean; docs: number; invites: number; biz: string }) {
  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <TopStrip />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-8 px-4 py-12 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
          <Check className="size-7" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">{biz}&apos;s Operator is learning</h1>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Everything starts at Learn, so nothing goes to a customer. Your team&apos;s first threads to check will be in Teach in about an hour.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [inboxes.length, inboxes.length === 1 ? "inbox connected" : "inboxes connected"],
            [1 + (phone ? 1 : 0), phone ? "agents created" : "agent created"],
            [docs, docs === 1 ? "document read" : "documents read"],
            [invites, invites === 1 ? "invite sent" : "invites sent"],
          ].map(([n, l]) => (
            <Card key={String(l)} className="gap-0.5 px-4 py-3.5 shadow-none">
              <span className="text-2xl font-semibold tabular-nums">{n}</span>
              <span className="text-[13px] text-muted-foreground">{l}</span>
            </Card>
          ))}
        </div>

        {/* Optional: see what was just made. */}
        <Card className="w-full gap-0 py-0 text-left">
          <div className="border-b px-5 py-3.5">
            <span className="font-medium">See what it made</span>
            <span className="block text-[13px] text-muted-foreground">Optional. You can always find these later under the Operator.</span>
          </div>
          <MadeLink href="/agents/op" icon={<Bot />} title="Email and texts agent" sub="Who it is, the inboxes it reads, and its tools" />
          <MadeLink href="/agents/op?tab=flow" icon={<Workflow />} title="Its workflow" sub="What happens step by step when a new email comes in" />
          {phone ? <MadeLink href="/agents/phone" icon={<Phone />} title="Inbound phone line agent" sub="Its greeting, voice and what it may do on a call" /> : null}
          <MadeLink href="/operator" icon={<Brain />} title="The Operator" sub="What it knows and where each request type is" />
        </Card>

        <Button size="lg" asChild>
          <Link href="/">
            Go to Home <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  )
}

function MadeLink({ href, icon, title, sub }: { href: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 border-b px-5 py-3 last:border-b-0 hover:bg-muted/40">
      <span className="grid size-8 flex-none place-items-center rounded-lg bg-muted text-muted-foreground [&>svg]:size-4">{icon}</span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-[13px] text-muted-foreground">{sub}</span>
      </span>
      <ArrowRight className="size-4 text-muted-foreground" />
    </Link>
  )
}
