"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { useState, type ReactNode } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { STEP_COLOR } from "@/lib/moneiva/agents-extra-data"
import { cn } from "@/lib/utils"

/**
 * Dotted canvas background. contain: inline-size keeps a wide canvas from stretching the page;
 * it scrolls sideways instead.
 */
export function CanvasSurface({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-x-auto rounded-xl border bg-zinc-50 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] bg-size-[16px_16px] px-5 py-7 [contain:inline-size] dark:bg-zinc-900 dark:bg-[radial-gradient(#3f3f46_1px,transparent_1px)]",
        className
      )}
    >
      <div className="mx-auto flex w-max flex-col items-center">{children}</div>
    </div>
  )
}

export type StepCardProps = {
  n: string
  kind: string
  title: string
  sub: string
  color?: string
  link?: string
  href?: string
  selected?: boolean
  isNew?: boolean
  changed?: boolean
  onClick?: () => void
  className?: string
}

/** One step on a canvas: numbered chip, kind, title, one line of detail. Clickable when onClick is set. */
export function StepCard({ n, kind, title, sub, color, link, href, selected, isNew, changed, onClick, className }: StepCardProps) {
  const body = (
    <>
      <span className="flex items-center gap-2">
        <span
          className="inline-grid size-[22px] shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white"
          style={{ background: color ?? STEP_COLOR[kind] ?? "#52525b" }}
        >
          {n}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{kind}</span>
        {isNew ? (
          <span className="ml-auto text-xs text-blue-700 dark:text-blue-300">New in draft</span>
        ) : changed ? (
          <span className="ml-auto text-xs text-blue-700 dark:text-blue-300">Changed in draft</span>
        ) : null}
      </span>
      <span className="font-medium">{title}</span>
      <span className="text-xs leading-snug text-muted-foreground">{sub}</span>
    </>
  )
  const cls = cn(
    "flex w-[300px] max-w-full flex-col gap-1.5 rounded-[10px] border bg-card px-3.5 py-3 text-left text-sm shadow-xs",
    (isNew || changed) && "border-dashed border-blue-300 dark:border-blue-800",
    selected && "border-primary ring-[3px] ring-ring/40",
    className
  )
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={selected} className={cn(cls, "cursor-pointer hover:border-zinc-400")}>
        {body}
      </button>
    )
  }
  return (
    <div className={cls}>
      {body}
      {link && href ? (
        <Link href={href} className="text-xs text-blue-600 hover:underline dark:text-blue-400">
          {link}
        </Link>
      ) : null}
    </div>
  )
}

/**
 * The line between two steps. While editing it shows a + that opens a menu of step kinds,
 * and accepts a step dragged from the palette.
 */
export function StepLink({
  editing,
  choices,
  onAdd,
  label = "Add a step here",
}: {
  editing?: boolean
  choices?: { label: string; kind: string }[]
  onAdd?: (choice: { label: string; kind: string }) => void
  label?: string
}) {
  const [over, setOver] = useState(false)
  return (
    <div className="flex flex-col items-center">
      <span className="h-3.5 w-0.5 bg-zinc-300 dark:bg-zinc-700" />
      {editing && choices && onAdd ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={label}
              onDragOver={(e) => {
                e.preventDefault()
                setOver(true)
              }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setOver(false)
                const raw = e.dataTransfer.getData("application/x-step")
                if (raw) onAdd(JSON.parse(raw))
              }}
              className={cn(
                "inline-grid size-5 place-items-center rounded-full border bg-card text-muted-foreground hover:border-primary hover:text-primary",
                over && "size-7 border-primary bg-blue-50 text-primary dark:bg-blue-950"
              )}
            >
              <Plus className="size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-48">
            <DropdownMenuLabel>Add a step</DropdownMenuLabel>
            {choices.map((c) => (
              <DropdownMenuItem key={c.label} onSelect={() => onAdd(c)}>
                <i className="size-2 rounded-sm" style={{ background: STEP_COLOR[c.kind] ?? "#52525b" }} />
                {c.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      <span className="h-3.5 w-0.5 bg-zinc-300 dark:bg-zinc-700" />
    </div>
  )
}

/** Blue note shown while a canvas is in draft. */
export function DraftNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
      {children}
    </div>
  )
}
