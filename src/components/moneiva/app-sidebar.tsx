"use client"

import { useEffect } from "react"
import { clearNewAgents } from "@/lib/moneiva/new-agents-store"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  BarChart3,
  Bot,
  Brain,
  ChevronsUpDown,
  FileText,
  GraduationCap,
  Home,
  Inbox,
  KeyRound,
  Settings,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LEARNING_IDS } from "@/lib/moneiva/agents-data"
import { inboxItems } from "@/lib/moneiva/inbox-data"
import { ACTIVITY } from "@/lib/moneiva/activity-data"
import { cn } from "@/lib/utils"

const FAILS = ACTIVITY.filter((r) => r.status === "fail").length

type NavItem = { title: string; icon: LucideIcon; href?: string; badge?: string; dot?: "amber" | "red"; dotLabel?: string }
type NavGroup = { label: string; items: NavItem[] }

// Proposed nav (Jake, Oct 16). Management items are in the nav only; their screens are not part of this mockup.
const NAV: NavGroup[] = [
  {
    label: "Work",
    items: [
      { title: "Home", icon: Home, href: "/" },
      { title: "Inbox", icon: Inbox, href: "/inbox", badge: String(inboxItems.length), dot: inboxItems.length ? "amber" : undefined, dotLabel: `${inboxItems.length} need you` },
      // A red dot only for work that couldn't finish. Activity is a log, so "new" alone isn't worth a dot.
      { title: "Activity", icon: Activity, href: "/activity", dot: FAILS ? "red" : undefined, dotLabel: `${FAILS} couldn't finish` },
    ],
  },
  {
    // The Operator is the brain: what it knows, how it learns, and the learning agents that feed it.
    label: "Operator",
    items: [
      { title: "Overview", icon: Brain, href: "/operator" },
      { title: "Teach", icon: GraduationCap, href: "/teach" },
      { title: "Playbook", icon: FileText, href: "/playbook" },
    ],
  },
  {
    // Task agents follow a script. Workflows decide when they run.
    label: "Build",
    items: [
      { title: "Task agents", icon: Bot, href: "/agents" },
      { title: "Workflows", icon: Workflow, href: "/workflows" },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Credentials", icon: KeyRound },
      { title: "Users", icon: Users },
      { title: "Settings", icon: Settings },
      { title: "KPI Charts", icon: BarChart3 },
    ],
  },
]

/** Learning agents belong to the Operator, so their pages light up Overview, not Task agents. */
const LEARNING_PAGES = LEARNING_IDS.map((id) => `/agents/${id}`)

function isActive(pathname: string, href?: string) {
  if (!href) return false
  if (LEARNING_PAGES.includes(pathname)) return href === "/operator"
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

export function AppSidebar() {
  const pathname = usePathname()
  // Agents made with Create agent last only while you stay on the agent pages (mockup only).
  useEffect(() => {
    if (!pathname.startsWith("/agents")) clearNewAgents()
  }, [pathname])
  if (pathname.startsWith("/setup")) return null
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex justify-center px-2 pt-2 pb-3 group-data-[collapsible=icon]:hidden">
          <Image src="/moneiva-logo.png" alt="Moneiva" width={128} height={32} className="h-auto w-32" priority />
        </div>
        {/* Collapsed: just the three bars from the logo, so the brand still shows. */}
        <Link href="/" aria-label="Moneiva home" className="hidden justify-center pt-2 pb-1 group-data-[collapsible=icon]:flex">
          <Image src="/moneiva-mark.png" alt="Moneiva" width={24} height={24} className="size-6" priority />
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {NAV.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.href ? (
                    <SidebarMenuButton asChild isActive={isActive(pathname, item.href)} tooltip={item.title}>
                      <Link href={item.href} aria-label={item.dot ? `${item.title}, ${item.dotLabel}` : undefined}>
                        <span className="relative flex">
                          <item.icon className="size-4" />
                          {item.dot ? (
                            <i
                              aria-hidden
                              className={cn(
                                "absolute -top-1 -right-1 size-2 rounded-full ring-2 ring-sidebar",
                                item.dot === "red" ? "bg-red-600" : "bg-amber-500",
                                // Open nav shows the count instead, so the Inbox dot only shows when collapsed.
                                item.badge && "hidden group-data-[collapsible=icon]:block"
                              )}
                            />
                          ) : null}
                        </span>
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton tooltip={`${item.title} (not in this mockup)`}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                  {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-xs font-semibold text-gray-600">
                TM
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[13px] font-medium">Taylor Morgan</span>
                <span className="truncate text-[11px] text-muted-foreground">taylor@example.test</span>
              </span>
              <ChevronsUpDown className="ml-auto text-muted-foreground" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
