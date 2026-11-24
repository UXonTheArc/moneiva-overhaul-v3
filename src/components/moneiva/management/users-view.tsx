"use client"

import { useState } from "react"
import { Ellipsis, Plus, Search } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/moneiva/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Role = "Admin" | "Team member" | "Viewer" | "Service account"
type User = { name: string; email: string; role: Role; team: string; last: string; pending?: boolean }

const ROLE_SUB: Record<Role, string> = {
  Admin: "Everything, including Management",
  "Team member": "Approves work, teaches, edits agents",
  Viewer: "Sees Activity and Trends only",
  "Service account": "For systems, not people",
}

const USERS: User[] = [
  { name: "Taylor Morgan", email: "taylor@example.test", role: "Admin", team: "LTL customer service", last: "Now" },
  { name: "Jordan Lee", email: "jordan@example.test", role: "Admin", team: "Carrier relations", last: "1 hr ago" },
  { name: "Sam Kim", email: "sam@example.test", role: "Team member", team: "LTL customer service", last: "Today" },
  { name: "Riley Chen", email: "riley@example.test", role: "Team member", team: "Claims", last: "Yesterday" },
  { name: "Alex Rivera", email: "alex@example.test", role: "Viewer", team: "Pricing", last: "Nov 12" },
  { name: "", email: "casey@example.test", role: "Team member", team: "Carrier relations", last: "", pending: true },
  { name: "Reporting service", email: "svc-reports@example.test", role: "Service account", team: "None", last: "Today" },
]

export function UsersView() {
  const [q, setQ] = useState("")
  const [invite, setInvite] = useState(false)
  const term = q.toLowerCase()
  const rows = USERS.filter((u) => !term || `${u.name} ${u.email} ${u.role} ${u.team}`.toLowerCase().includes(term))
  return (
    <>
      <PageHeader
        title="Users"
        description="Who can sign in, what they can do, and which team they work for."
        actions={
          <Button onClick={() => setInvite(true)}>
            <Plus /> Invite people
          </Button>
        }
      />
      <div className="relative w-full max-w-80">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people" className="pl-9" aria-label="Search people" />
      </div>
      <Card className="gap-0 overflow-hidden p-0">
        <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_120px_40px] gap-4 border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground md:grid">
          <span>Person</span>
          <span>Role</span>
          <span>Team</span>
          <span>Last active</span>
          <span />
        </div>
        <ul className="divide-y">
          {rows.map((u) => (
            <li key={u.email} className="grid grid-cols-[minmax(0,1fr)_auto_40px] items-center gap-x-4 px-4 py-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_120px_40px]">
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 flex-none place-items-center rounded-full bg-muted text-xs font-medium uppercase">
                  {(u.name || u.email)
                    .split(/[ @]/)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")}
                </span>
                <span className="flex min-w-0 flex-col leading-snug">
                  <span className="truncate text-sm font-medium">{u.name || u.email}</span>
                  <span className="truncate text-xs text-muted-foreground">{u.pending ? "Invite sent Nov 20 · not signed in yet" : u.email}</span>
                </span>
              </span>
              <span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    u.role === "Admin" ? "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200" : "bg-muted text-muted-foreground"
                  )}
                >
                  {u.role}
                </span>
              </span>
              <span className="hidden truncate text-[13px] text-muted-foreground md:block">{u.team}</span>
              <span className="hidden text-[13px] text-muted-foreground md:block">{u.pending ? "Invited" : u.last}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label={`More for ${u.name || u.email}`}>
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {u.pending ? <DropdownMenuItem onSelect={() => toast.success(`Invite sent again to ${u.email}.`)}>Resend invite</DropdownMenuItem> : null}
                  <DropdownMenuItem>Change role</DropdownMenuItem>
                  <DropdownMenuItem>Change team</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">{u.pending ? "Cancel invite" : "Remove"}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      </Card>
      <InviteDialog open={invite} onOpenChange={setInvite} />
    </>
  )
}

function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [emails, setEmails] = useState("")
  const [role, setRole] = useState<Role>("Team member")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
          <DialogDescription>They get an email to sign in. Only addresses at example.test can join.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inv-emails">Email addresses</Label>
          <Input id="inv-emails" placeholder="name@example.test, another@example.test" value={emails} onChange={(e) => setEmails(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inv-role">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger id="inv-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["Admin", "Team member", "Viewer"] as Role[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {r} · {ROLE_SUB[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              toast.success(emails.trim() ? `Invite sent to ${emails.trim()}.` : "Invite sent.")
              setEmails("")
            }}
          >
            Send invite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
