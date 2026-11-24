"use client";

import { ArrowDown, ArrowUp, Lock, Play, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { StageBadge, ToneBadge } from "@/components/moneiva/status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { KIND_LABEL, type Agent } from "@/lib/moneiva/agents-data";
import {
  ADD_STEP_KINDS,
  PROFILE_OPTIONS,
  RUNSET,
  STAGE_OVERRIDES,
  USED,
  requestTypesFor,
  withValue,
  type FlowStep,
} from "@/lib/moneiva/agents-extra-data";

import { CanvasSurface, DraftNote, StepCard, StepLink } from "./canvas";
import { FormRow, Section, SimpleSelect } from "./form-row";

const isVoice = (a: Agent) => a.kind === "inbound" || a.kind === "outbound";

// ---------------- Profile ----------------

export function ProfileTab({ agent: a }: { agent: Agent }) {
  const [formKey, setFormKey] = useState(0);
  const voice = isVoice(a);
  const addrLabel =
    a.kind === "email"
      ? "Inbox"
      : a.kind === "files"
        ? "Folder"
        : "Phone number";
  const addrHint =
    a.kind === "email"
      ? "Uses the Gmail connection. Manage it in Settings, under Connections."
      : a.kind === "files"
        ? "New files here start a run."
        : "Manage numbers in Settings, under Phone numbers.";
  const addrOptions = withValue(
    a.address,
    a.kind === "email"
      ? PROFILE_OPTIONS.address.email
      : a.kind === "files"
        ? PROFILE_OPTIONS.address.files
        : PROFILE_OPTIONS.address.phone,
  );
  const id = (k: string) => `${a.id}-${k}`;

  return (
    <div key={formKey} className="flex max-w-[860px] flex-col gap-4">
      <Section title="About" sub="How this agent shows up across Moneiva.">
        <FormRow label="Name" htmlFor={id("name")}>
          <Input id={id("name")} defaultValue={a.name} />
        </FormRow>
        <FormRow label="Description" htmlFor={id("desc")}>
          <Textarea
            id={id("desc")}
            defaultValue={a.desc}
            className="min-h-9"
            rows={2}
          />
        </FormRow>
        <FormRow label={addrLabel} htmlFor={id("addr")} hint={addrHint}>
          <SimpleSelect
            id={id("addr")}
            defaultValue={a.address}
            options={addrOptions}
          />
        </FormRow>
        <FormRow label="Works for" htmlFor={id("team")}>
          <SimpleSelect
            id={id("team")}
            defaultValue={a.team}
            options={withValue(a.team, PROFILE_OPTIONS.team)}
          />
        </FormRow>
        {!voice ? (
          <FormRow label="Language" htmlFor={id("lang")}>
            <SimpleSelect
              id={id("lang")}
              defaultValue={a.language}
              options={withValue(a.language, PROFILE_OPTIONS.language)}
            />
          </FormRow>
        ) : null}
        <FormRow label="Time zone" htmlFor={id("tz")}>
          <SimpleSelect
            id={id("tz")}
            defaultValue={a.tz}
            options={withValue(a.tz, PROFILE_OPTIONS.tz)}
          />
        </FormRow>
        <FormRow label="Type">
          <span className="text-sm sm:pt-2">
            {KIND_LABEL[a.kind]}{" "}
            <span className="text-xs text-muted-foreground">
              · can&apos;t be changed after it&apos;s created
            </span>
          </span>
        </FormRow>
      </Section>

      {voice ? (
        <Section
          title="On the call"
          sub="How it introduces itself, how it sounds, the languages it speaks, and who takes over when it can't help."
        >
          <FormRow
            label="Name it gives"
            htmlFor={id("callName")}
            hint={`What callers hear, like "This is ${a.callName}". It doesn't change the agent's name in Moneiva.`}
          >
            <Input id={id("callName")} defaultValue={a.callName} />
          </FormRow>
          <FormRow
            label={
              a.kind === "outbound" ? "Calling on behalf of" : "Answers for"
            }
            htmlFor={id("from")}
          >
            <Input id={id("from")} defaultValue={a.callingFrom} />
          </FormRow>
          <FormRow label="Voice" htmlFor={id("voice")}>
            <div className="flex gap-2">
              <SimpleSelect
                id={id("voice")}
                defaultValue={a.voice}
                options={withValue(a.voice, PROFILE_OPTIONS.voice)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => toast("Playing a sample of the voice.")}
              >
                <Play /> Play sample
              </Button>
            </div>
          </FormRow>
          <FormRow label="Main language" htmlFor={id("lang1")}>
            <SimpleSelect
              id={id("lang1")}
              defaultValue={a.language}
              options={withValue(a.language, PROFILE_OPTIONS.language)}
            />
          </FormRow>
          <FormRow
            label="Other languages"
            htmlFor={id("lang2")}
            hint="It switches when the other person does."
          >
            <SimpleSelect
              id={id("lang2")}
              defaultValue={a.language2}
              options={withValue(a.language2, PROFILE_OPTIONS.language2)}
            />
          </FormRow>
          <FormRow label="First thing it says" htmlFor={id("greeting")}>
            <Input id={id("greeting")} defaultValue={a.greeting} />
          </FormRow>
          <FormRow
            label="If it can't help"
            htmlFor={id("fallback")}
            hint="The backup agent or person who takes the call."
          >
            <SimpleSelect
              id={id("fallback")}
              defaultValue={a.fallback}
              options={withValue(a.fallback, PROFILE_OPTIONS.fallback)}
            />
          </FormRow>
        </Section>
      ) : null}

      <Section
        title="Persona"
        sub="Who it is and what it may do. Leave procedures out. It learns those in Teach."
      >
        <FormRow label="Who it is" htmlFor={id("who")}>
          <Textarea
            id={id("who")}
            defaultValue={a.who}
            className="min-h-9"
            rows={2}
          />
        </FormRow>
        <FormRow label="Its goal" htmlFor={id("goal")}>
          <Textarea
            id={id("goal")}
            defaultValue={a.goal}
            className="min-h-9"
            rows={2}
          />
        </FormRow>
        <FormRow label="It may" htmlFor={id("may")}>
          <Textarea
            id={id("may")}
            defaultValue={a.may}
            className="min-h-9"
            rows={2}
          />
        </FormRow>
        <FormRow label="It may never" htmlFor={id("mayNot")}>
          <Textarea
            id={id("mayNot")}
            defaultValue={a.mayNot}
            className="min-h-9"
            rows={2}
          />
        </FormRow>
      </Section>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setFormKey((k) => k + 1)}>
          Cancel
        </Button>
        <Button
          onClick={() =>
            toast.success("Saved. It applies to the next email or call.")
          }
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}

// ---------------- Request types ----------------

export function TypesTab({ agent }: { agent: Agent }) {
  const types = requestTypesFor(agent);
  const [all, setAll] = useState(false);
  const [handled, setHandled] = useState<Record<string, boolean>>({});
  const [override, setOverride] = useState(STAGE_OVERRIDES[0]);
  const shown = all ? types : types.slice(0, 8);

  return (
    <Section
      title="What it handles"
      sub="Each request type's stage comes from Playbook. It moves up only when your team moves it."
      aside={
        <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:min-w-[340px]">
          <label
            htmlFor="stage-override"
            className="text-xs font-medium text-muted-foreground"
          >
            Stage for every request type
          </label>
          <SimpleSelect
            id="stage-override"
            value={override}
            onChange={setOverride}
            options={STAGE_OVERRIDES}
          />
        </div>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Request type</TableHead>
            <TableHead className="w-[140px]">Last 30 days</TableHead>
            <TableHead className="w-[120px]">Stage</TableHead>
            <TableHead className="w-[180px] text-right">
              Handled by this agent
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shown.map((t) => {
            const on = handled[t.name] !== false;
            return (
              <TableRow key={t.name}>
                <TableCell className="py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{t.name}</span>
                    <Link
                      href={`/playbook?type=${encodeURIComponent(t.name)}`}
                      className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                    >
                      See in Playbook
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {t.stage === "Learn"
                    ? "New"
                    : `${t.of} ${agent.kind === "inbound" || agent.kind === "outbound" ? "calls" : agent.kind === "files" ? "files" : "emails"}`}
                </TableCell>
                <TableCell>
                  <StageBadge stage={t.stage} />
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={on}
                    aria-label={`${t.name} handled by this agent`}
                    onCheckedChange={(v) =>
                      setHandled((h) => ({ ...h, [t.name]: v }))
                    }
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {!all && types.length > 8 ? (
          <Button variant="ghost" size="sm" onClick={() => setAll(true)}>
            Show all {types.length}
          </Button>
        ) : null}
        <Button variant="outline" size="sm" asChild>
          <Link href="/playbook">
            <Plus /> Add a request type
          </Link>
        </Button>
        <span className="ml-auto text-[13px] text-muted-foreground">
          4 more request types are handled by other agents.
        </span>
      </div>
    </Section>
  );
}

// ---------------- How it runs ----------------

export type DraftStep = FlowStep & {
  key: string;
  isNew?: boolean;
  changed?: boolean;
};

/**
 * Steps every agent keeps: where it starts, the agent itself, and the Activity log (so every run can be audited).
 * They can be changed but not deleted or moved.
 */
export const lockReason = (s: DraftStep) =>
  s.kind === "Starts when"
    ? "Every agent needs a start. You can change what starts it, but not remove it."
    : s.kind === "Record"
      ? "Every run is logged to Activity so your team can check what it did. This step can't be removed."
      : s.key === "s1"
        ? "This is the agent itself. Change who it is on Profile and what it can reach on Tools."
        : null;

export type StepEdits = {
  selected: string | null;
  onSelect: (key: string | null) => void;
  onChange: (key: string, patch: Partial<DraftStep>) => void;
  onDelete: (key: string) => void;
  onMove: (key: string, dir: -1 | 1) => void;
};

export function FlowTab({
  agent,
  steps,
  editing,
  onAdd,
  edits,
}: {
  agent: Agent;
  steps: DraftStep[];
  editing: boolean;
  onAdd: (index: number, kind: string) => void;
  edits: StepEdits;
}) {
  const selIndex = editing
    ? steps.findIndex((s) => s.key === edits.selected)
    : -1;
  const sel = selIndex >= 0 ? steps[selIndex] : null;
  const used = USED[agent.id];
  const choices = ADD_STEP_KINDS.map((k) => ({ label: k, kind: k }));
  return (
    <div className="flex flex-col gap-4">
      {editing ? (
        <DraftNote>
          You are editing a draft. The live version keeps running until you
          publish. Click a step to change, move or delete it, or add one on any
          +.
        </DraftNote>
      ) : null}
      <div className="flex flex-col items-start gap-4 lg:flex-row">
        <CanvasSurface className="w-full flex-1">
          {steps.map((s, i) => (
            <div key={s.key} className="flex flex-col items-center">
              {i > 0 ? (
                <StepLink
                  editing={editing}
                  choices={choices}
                  onAdd={(c) => onAdd(i, c.kind)}
                />
              ) : null}
              <StepCard
                n={String(i + 1)}
                kind={s.kind}
                title={s.title}
                sub={s.sub}
                link={editing ? undefined : s.link}
                href={s.href}
                isNew={s.isNew}
                changed={editing && s.changed}
                selected={s.key === edits.selected && editing}
                onClick={
                  editing
                    ? () =>
                        edits.onSelect(s.key === edits.selected ? null : s.key)
                    : undefined
                }
              />
            </div>
          ))}
        </CanvasSurface>
        <div className="flex w-full flex-col gap-4 lg:w-[340px] lg:flex-none">
          {sel ? (
            <StepEditor
              key={sel.key}
              step={sel}
              index={selIndex}
              count={steps.length}
              steps={steps}
              edits={edits}
            />
          ) : null}
          <Section title="When it runs" sub="Saves as soon as you change it.">
            {RUNSET[agent.id].map((r) => (
              <div key={r.label} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  {r.label}
                </span>
                <SimpleSelect
                  label={r.label}
                  wrap
                  defaultValue={r.value}
                  options={r.options}
                  onChange={(v) => toast.success(`${r.label}: ${v}. Saved.`)}
                />
              </div>
            ))}
          </Section>
          <Section
            title="Used in workflows"
            sub="Workflows hand work to this agent, or pick up what it finishes."
          >
            {used.map((u) => (
              <Link
                key={u.name}
                href={u.href}
                className="flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 hover:bg-accent/50"
              >
                <span className="font-medium">{u.name}</span>
                <span className="text-xs text-muted-foreground">{u.sub}</span>
              </Link>
            ))}
            {used.length === 0 ? (
              <span className="text-[13px] text-muted-foreground">
                Not used in any workflow.
              </span>
            ) : null}
            <Link
              href="/workflows"
              className="text-[13px] text-blue-600 hover:underline dark:text-blue-400"
            >
              See all workflows
            </Link>
          </Section>
          <Button variant="outline" className="self-start" asChild>
            <Link href="/activity">See its runs in Activity</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------- Tools ----------------

export function ToolsTab({ agent }: { agent: Agent }) {
  const [state, setState] = useState<Record<string, boolean>>({});
  return (
    <Section
      className="max-w-[860px]"
      title="Tools and connections"
      sub="What this agent can reach and do. Turn one off and the agent hands that work to a person."
    >
      <div className="flex flex-col">
        {agent.tools.map(([name, sub, label, initial]) => {
          const on = state[name] ?? initial;
          return (
            <div key={name} className="flex items-center gap-3.5 border-t py-3">
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="font-medium">{name}</span>
                <span className="text-[13px] text-muted-foreground">{sub}</span>
              </span>
              <ToneBadge tone={on ? "green" : "muted"}>
                {on ? (label === "Off" ? "On" : label) : "Off"}
              </ToneBadge>
              <Switch
                checked={on}
                aria-label={name}
                onCheckedChange={(v) => setState((s) => ({ ...s, [name]: v }))}
              />
            </div>
          );
        })}
        {agent.tools.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            No tools to set up for this agent.
          </span>
        ) : null}
      </div>
    </Section>
  );
}

// ---------------- Data ----------------

export function DataTab({ agent }: { agent: Agent }) {
  const [cols, setCols] = useState<Record<string, boolean>>({});
  return (
    <Section
      className="max-w-[860px]"
      title="What it fills in"
      sub="Fields it saves on every conversation. Pick which ones show as columns in Activity."
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead className="w-[180px] text-right">
              Column in Activity
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agent.outputs.map(([name, initial]) => {
            const on = cols[name] ?? initial;
            return (
              <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={on}
                    aria-label={`Show ${name} as a column`}
                    onCheckedChange={(v) =>
                      setCols((c) => ({ ...c, [name]: v }))
                    }
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="mt-3 flex flex-col gap-0.5">
        <h3 className="font-semibold">What it needs to start</h3>
        <p className="text-[13px] text-muted-foreground">
          Only outbound agents need these, to know who to call and why.
        </p>
      </div>
      {agent.inputs.length ? (
        <div className="flex flex-wrap gap-1.5">
          {agent.inputs.map((i) => (
            <Badge key={i} variant="secondary">
              {i}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">
          Nothing. It starts on its own when an email or call comes in.
        </span>
      )}
    </Section>
  );
}

function StepEditor({
  step,
  index,
  count,
  steps,
  edits,
}: {
  step: DraftStep;
  index: number;
  count: number;
  steps: DraftStep[];
  edits: StepEdits;
}) {
  const lock = lockReason(step);
  // Steps can move anywhere between the start and the Activity log.
  const canUp = !lock && index > 1;
  const canDown = !lock && index < count - 2;
  return (
    <Card className="gap-3.5 border-primary/40 p-[18px] ring-[3px] ring-ring/20">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-muted-foreground">
            Step {index + 1} · {step.kind}
          </span>
          <span className="text-base font-semibold">Change this step</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close step"
          onClick={() => edits.onSelect(null)}
        >
          <X />
        </Button>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={`st-${step.key}`}
          className="text-xs text-muted-foreground"
        >
          Name
        </Label>
        <Input
          id={`st-${step.key}`}
          value={step.title}
          onChange={(e) =>
            edits.onChange(step.key, { title: e.target.value, changed: true })
          }
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={`ss-${step.key}`}
          className="text-xs text-muted-foreground"
        >
          {step.kind === "Check" ? "If yes, if no" : "What it does"}
        </Label>
        <Textarea
          id={`ss-${step.key}`}
          rows={3}
          value={step.sub}
          onChange={(e) =>
            edits.onChange(step.key, { sub: e.target.value, changed: true })
          }
        />
      </div>
      {lock ? (
        <span className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          <Lock className="mt-px size-3.5 flex-none" /> {lock}
        </span>
      ) : null}
      {lock ? null : (
        <div className="flex flex-wrap items-center gap-1.5 border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!canUp}
            onClick={() => edits.onMove(step.key, -1)}
          >
            <ArrowUp /> Move up
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!canDown}
            onClick={() => edits.onMove(step.key, 1)}
          >
            <ArrowDown /> Move down
          </Button>
          {!lock ? (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-destructive hover:text-destructive"
              onClick={() => {
                const at = steps.findIndex((s) => s.key === step.key);
                edits.onDelete(step.key);
                toast(`Deleted step ${at + 1} from the draft.`, {
                  action: {
                    label: "Undo",
                    onClick: () =>
                      edits.onChange("__restore__", {
                        ...step,
                        key: `${at}|${step.key}`,
                      }),
                  },
                });
              }}
            >
              <Trash2 /> Delete step
            </Button>
          ) : null}
        </div>
      )}
    </Card>
  );
}
