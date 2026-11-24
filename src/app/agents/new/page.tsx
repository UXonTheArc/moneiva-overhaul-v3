import { Suspense } from "react"

import { NewAgentDetail } from "@/components/moneiva/agents/new-agent-detail"
import { Page } from "@/components/moneiva/page-header"

/** An agent made with Create agent on this visit (mockup only). */
export default function NewAgentPage() {
  return (
    <Page title="Task agents">
      <Suspense>
        <NewAgentDetail />
      </Suspense>
    </Page>
  )
}
