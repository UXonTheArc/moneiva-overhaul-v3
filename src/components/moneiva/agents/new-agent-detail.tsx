"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { AgentId } from "@/lib/moneiva/agents-extra-data"
import { useNewAgents } from "@/lib/moneiva/new-agents-store"
import { useHydrated } from "@/lib/moneiva/use-hydrated"

import { AgentDetail } from "./agent-detail"

export function NewAgentDetail() {
  const id = useSearchParams().get("id")
  const hydrated = useHydrated()
  const made = useNewAgents().find((n) => n.agent.id === id)
  if (!hydrated) return null
  if (!made)
    return (
      <Card className="items-center gap-3 px-6 py-14 text-center">
        <h2 className="text-lg font-semibold">This agent is gone</h2>
        <p className="max-w-md text-muted-foreground">New agents in this mockup only last until you leave the agent pages. Make another one from Task agents.</p>
        <Button asChild>
          <Link href="/agents">Back to Task agents</Link>
        </Button>
      </Card>
    )
  return <AgentDetail id={made.agent.id as AgentId} custom={made} />
}
