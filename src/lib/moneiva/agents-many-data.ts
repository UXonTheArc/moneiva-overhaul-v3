import type { AgentKind } from "./agents-data"
import type { AgentStatus } from "./data"

/**
 * A large account: 20 task agents. Shows how the Task agents page holds up when a team copies
 * an agent for each big customer or desk. Copies point at their original agent's page in this mockup.
 */

export type ListAgent = {
  id: string
  name: string
  /** Original agent this one was copied from. Copies fold under it. */
  base?: string
  kind: AgentKind
  status: AgentStatus
  channel: string
  team: string
  today: number
  todayLabel: string
  needs?: string
  error?: string
  runs: string
  href: string
  /** Just made on this visit (mockup only). */
  fresh?: boolean
}

const a = (x: Omit<ListAgent, "href"> & { href?: string }): ListAgent => ({ href: "/agents/check", ...x })

export const MANY_AGENTS: ListAgent[] = [
  a({ id: "check", name: "Carrier check calls", kind: "outbound", status: "live", channel: "Outbound calls · (555) 010-0188", team: "Carrier relations", today: 5, todayLabel: "calls", runs: "Weekdays at 9 AM and 2 PM" }),
  a({ id: "check-nw", base: "check", name: "Carrier check calls – Northwind", kind: "outbound", status: "live", channel: "Outbound calls · (555) 010-0210", team: "Northwind desk", today: 12, todayLabel: "calls", runs: "Every 2 hours" }),
  a({ id: "check-co", base: "check", name: "Carrier check calls – Contoso Retail", kind: "outbound", status: "live", channel: "Outbound calls · (555) 010-0211", team: "Contoso desk", today: 7, todayLabel: "calls", runs: "Weekdays at 10 AM" }),
  a({ id: "check-fb", base: "check", name: "Carrier check calls – Fabrikam", kind: "outbound", status: "live", channel: "Outbound calls · (555) 010-0212", team: "Fabrikam desk", today: 4, todayLabel: "calls", needs: "2 calls to check", runs: "Weekdays at 9 AM" }),
  a({ id: "check-west", base: "check", name: "Carrier check calls – West desk", kind: "outbound", status: "off", channel: "Outbound calls · (555) 010-0213", team: "West desk", today: 0, todayLabel: "calls", runs: "Off since Nov 2" }),

  a({ id: "osd", name: "OS&D check calls", kind: "outbound", status: "error", channel: "Outbound calls · (555) 010-0199", team: "Claims", today: 0, todayLabel: "calls", error: "Its phone number can no longer place calls.", runs: "3 reports waiting", href: "/agents/osd" }),
  a({ id: "osd-east", base: "osd", name: "OS&D check calls – East desk", kind: "outbound", status: "live", channel: "Outbound calls · (555) 010-0220", team: "East claims", today: 6, todayLabel: "calls", runs: "New OS&D file", href: "/agents/osd" }),
  a({ id: "osd-nw", base: "osd", name: "OS&D check calls – Northwind", kind: "outbound", status: "live", channel: "Outbound calls · (555) 010-0221", team: "Northwind desk", today: 2, todayLabel: "calls", runs: "New OS&D file", href: "/agents/osd" }),

  a({ id: "appt", name: "Appointment booking", kind: "outbound", status: "live", channel: "Outbound calls · (555) 010-0230", team: "Scheduling", today: 18, todayLabel: "calls", runs: "When a load has no appointment" }),
  a({ id: "appt-nw", base: "appt", name: "Appointment booking – Northwind DCs", kind: "outbound", status: "live", channel: "Outbound calls · (555) 010-0231", team: "Northwind desk", today: 9, todayLabel: "calls", needs: "1 call to check", runs: "When a load has no appointment" }),
  a({ id: "appt-fb", base: "appt", name: "Appointment booking – Fabrikam", kind: "outbound", status: "test", channel: "Outbound calls · (555) 010-0232", team: "Fabrikam desk", today: 3, todayLabel: "test calls", runs: "Testing since Nov 17" }),

  a({ id: "eta", name: "Driver ETA texts", kind: "outbound", status: "live", channel: "Texts · (555) 010-0240", team: "Dispatch", today: 41, todayLabel: "texts", runs: "Every hour while a load is moving" }),
  a({ id: "eta-night", base: "eta", name: "Driver ETA texts – Night shift", kind: "outbound", status: "live", channel: "Texts · (555) 010-0241", team: "Night dispatch", today: 16, todayLabel: "texts", runs: "Every hour, 6 PM to 6 AM" }),

  a({ id: "pod", name: "POD chasing", kind: "email", status: "live", channel: "Email · pod@example.test", team: "Billing", today: 23, todayLabel: "emails", runs: "Daily at 8 AM" }),
  a({ id: "pod-west", base: "pod", name: "POD chasing – Carriers West", kind: "email", status: "live", channel: "Email · pod-west@example.test", team: "West desk", today: 8, todayLabel: "emails", runs: "Daily at 8 AM" }),

  a({ id: "claims", name: "Detention and accessorial claims", kind: "email", status: "live", channel: "Email · claims@example.test", team: "Billing", today: 6, todayLabel: "emails", needs: "3 claims to approve", runs: "When a claim email arrives" }),
  a({ id: "quote", name: "Quote follow-ups", kind: "email", status: "paused", channel: "Email · quotes@example.test", team: "Sales", today: 0, todayLabel: "emails", runs: "Paused by Jordan" }),
  a({ id: "ratecon", name: "Rate confirmations", kind: "files", status: "live", channel: "Files · Rate cons folder", team: "Carrier relations", today: 31, todayLabel: "files", runs: "When a file lands in the folder" }),

  a({ id: "cat", name: "Catalog updates", kind: "files", status: "off", channel: "Files · Catalog folder", team: "Pricing", today: 0, todayLabel: "files", runs: "Off since Sep 30", href: "/agents/cat" }),
  a({ id: "cat-co", base: "cat", name: "Catalog updates – Contoso price files", kind: "files", status: "live", channel: "Files · Contoso pricing", team: "Pricing", today: 2, todayLabel: "files", runs: "When a file lands in the folder", href: "/agents/cat" }),
]

export const KIND_LABEL: Record<AgentKind, string> = { outbound: "Calls and texts", email: "Email", files: "Files", inbound: "Inbound calls" }
