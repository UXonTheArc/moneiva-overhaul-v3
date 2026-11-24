"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bot,
  Ellipsis,
  Pin,
  PinOff,
  Pencil,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DAYS, type Kpi } from "@/lib/moneiva/kpi-data";

/**
 * One small chart. Sized to sit four across, so it fits on Home without taking it over.
 * The footer says which agent collected the data and from which field.
 */
export function KpiCard({
  k,
  pinned,
  onPin,
  onRemove,
  onHome,
  className,
}: {
  /** Shown on Home: no "Home" tag, since that's where it is. */
  onHome?: boolean;
  k: Kpi;
  pinned?: boolean;
  onPin?: () => void;
  onRemove?: () => void;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const readout =
    hover !== null && k.points
      ? `${DAYS[hover]}: ${k.points[hover]}${k.unit ? ` ${k.unit}` : ""}`
      : null;
  const sourceHref =
    k.agentId === "all" ? "/activity" : `/agents/${k.agentId}?tab=data`;

  return (
    <Card className={cn("gap-3 p-4", className)}>
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1 text-sm font-medium">{k.title}</span>
        {pinned && !onHome ? (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
            title="Shown on Home"
          >
            <Pin className="size-3" /> Home
          </span>
        ) : null}
        {onPin ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="-mt-1 -mr-1 size-7"
                aria-label={`More for ${k.title}`}
              >
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={onPin}>
                {pinned ? <PinOff /> : <Pin />}{" "}
                {pinned ? "Remove from Home" : "Add to Home"}
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Pencil /> Edit chart
              </DropdownMenuItem>
              {onRemove ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={onRemove}>
                    <Trash2 /> Delete chart
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>

      <div className="flex min-h-12 flex-col">
        <span className="text-2xl leading-tight font-semibold tabular-nums">
          {k.value}
          {k.unit ? (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {k.unit}
            </span>
          ) : null}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {readout ??
            (k.delta ? (
              <span className="inline-flex items-center gap-1">
                {k.delta.good ? (
                  <TrendingUp className="size-3.5 text-green-700 dark:text-green-400" />
                ) : (
                  <TrendingDown className="size-3.5 text-red-700" />
                )}
                {k.delta.text}
              </span>
            ) : k.kind === "breakdown" ? (
              "total, last 7 days"
            ) : (
              "last 7 days"
            ))}
        </span>
      </div>

      <div className="flex min-h-[84px] flex-col justify-center">
        {k.kind === "breakdown" && k.parts ? (
          <Breakdown parts={k.parts} />
        ) : k.points ? (
          k.kind === "bars" ? (
            <Bars
              points={k.points}
              hover={hover}
              setHover={setHover}
              label={k.title}
            />
          ) : (
            <Line
              points={k.points}
              hover={hover}
              setHover={setHover}
              label={k.title}
              faint={k.kind === "stat"}
            />
          )
        ) : null}
        {k.points && k.kind !== "breakdown" ? (
          <span className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{DAYS[0]}</span>
            <span>{DAYS[DAYS.length - 1]}</span>
          </span>
        ) : null}
      </div>

      <Link
        href={sourceHref}
        className="mt-auto flex items-start gap-1.5 border-t pt-2.5 text-[11px] leading-snug text-muted-foreground hover:text-foreground"
        title="Open where this data comes from"
      >
        <Bot className="mt-px size-3.5 flex-none" />
        <span className="min-w-0">
          <span className="font-medium text-foreground">{k.agentName}</span> ·{" "}
          {k.field}
          <span className="block truncate">{k.from}</span>
        </span>
      </Link>
    </Card>
  );
}

const W = 280;
const H = 84;

function Line({
  points,
  hover,
  setHover,
  label,
  faint,
}: {
  points: number[];
  hover: number | null;
  setHover: (i: number | null) => void;
  label: string;
  faint?: boolean;
}) {
  const max = Math.max(...points, 1);
  const x = (i: number) => 6 + (i * (W - 12)) / (points.length - 1);
  const y = (v: number) => H - 6 - (v / max) * (H - 16);
  const d = points.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-[84px] w-full overflow-visible"
      role="img"
      aria-label={`${label}, by day: ${points.join(", ")}`}
      onMouseLeave={() => setHover(null)}
    >
      <line
        x1={0}
        x2={W}
        y1={H - 6}
        y2={H - 6}
        className="stroke-border"
        strokeWidth={1}
      />
      {!faint ? (
        <path
          d={`${d} L${x(points.length - 1)},${H - 6} L${x(0)},${H - 6} Z`}
          fill="var(--series-1-soft)"
        />
      ) : null}
      <path
        d={d}
        fill="none"
        stroke="var(--series-1)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={faint ? 0.7 : 1}
      />
      {hover !== null ? (
        <>
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={4}
            y2={H - 6}
            className="stroke-muted-foreground/40"
            strokeWidth={1}
          />
          <circle
            cx={x(hover)}
            cy={y(points[hover])}
            r={4}
            fill="var(--series-1)"
            className="stroke-card"
            strokeWidth={2}
          />
        </>
      ) : null}
      {points.map((_, i) => (
        <rect
          key={i}
          x={x(i) - W / points.length / 2}
          y={0}
          width={W / points.length}
          height={H}
          fill="transparent"
          onMouseEnter={() => setHover(i)}
        />
      ))}
    </svg>
  );
}

function Bars({
  points,
  hover,
  setHover,
  label,
}: {
  points: number[];
  hover: number | null;
  setHover: (i: number | null) => void;
  label: string;
}) {
  const max = Math.max(...points, 1);
  const slot = W / points.length;
  const bw = Math.min(22, slot - 8);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-[84px] w-full"
      role="img"
      aria-label={`${label}, by day: ${points.join(", ")}`}
      onMouseLeave={() => setHover(null)}
    >
      <line
        x1={0}
        x2={W}
        y1={H - 6}
        y2={H - 6}
        className="stroke-border"
        strokeWidth={1}
      />
      {points.map((v, i) => {
        const h = Math.max(v ? 3 : 0, (v / max) * (H - 16));
        const bx = i * slot + (slot - bw) / 2;
        return (
          <g key={i} onMouseEnter={() => setHover(i)}>
            <rect
              x={i * slot}
              y={0}
              width={slot}
              height={H}
              fill="transparent"
            />
            {h > 0 ? (
              <path
                d={`M${bx},${H - 6} V${H - 6 - h + 4} Q${bx},${H - 6 - h} ${bx + 4},${H - 6 - h} H${bx + bw - 4} Q${bx + bw},${H - 6 - h} ${bx + bw},${H - 6 - h + 4} V${H - 6} Z`}
                fill="var(--series-1)"
                opacity={hover === null || hover === i ? 1 : 0.45}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function Breakdown({ parts }: { parts: { label: string; value: number }[] }) {
  const max = Math.max(...parts.map((p) => p.value), 1);
  return (
    <ul className="flex flex-col gap-1.5">
      {parts.slice(0, 4).map((p) => (
        <li
          key={p.label}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 text-[11px]"
          title={`${p.label}: ${p.value}`}
        >
          <span className="truncate text-muted-foreground">{p.label}</span>
          <span className="font-medium tabular-nums">{p.value}</span>
          <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full"
              style={{
                width: `${(p.value / max) * 100}%`,
                background: "var(--series-1)",
              }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
