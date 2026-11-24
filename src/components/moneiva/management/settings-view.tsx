"use client"

import { Upload } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/moneiva/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SettingsView() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Your company's details, sign-in rules, and how long Moneiva keeps data."
        actions={
          <>
            <Button variant="outline">Cancel</Button>
            <Button onClick={() => toast.success("Settings saved.")}>Save</Button>
          </>
        }
      />
      <Tabs defaultValue="company" className="gap-5">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="signin">Sign-in</TabsTrigger>
          <TabsTrigger value="ai">AI rules and risk</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <Box title="Logo" sub="Shows in the nav and on emails it sends.">
              <div className="grid h-24 place-items-center rounded-lg border border-dashed">
                <span className="text-2xl font-black tracking-tight text-blue-900 dark:text-blue-200">ACME</span>
              </div>
              <Button variant="outline" className="w-full">
                <Upload /> Upload logo
              </Button>
            </Box>
            <Box title="Keep data for" sub="After this, recordings and messages are deleted.">
              <Field id="ret-audio" label="Call recordings">
                <Days id="ret-audio" value="30" />
              </Field>
              <Field id="ret-text" label="Emails, texts and transcripts">
                <Days id="ret-text" value="365" />
              </Field>
            </Box>
          </div>
          <div className="flex flex-col gap-4">
            <Box title="Company" sub="Used when agents introduce themselves and sign emails.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="co-name" label="Company name">
                  <Input id="co-name" defaultValue="Acme Logistics" />
                </Field>
                <Field id="co-short" label="Short name">
                  <Input id="co-short" defaultValue="acme" />
                </Field>
                <Field id="co-addr" label="Address">
                  <Input id="co-addr" defaultValue="100 Example Way" />
                </Field>
                <Field id="co-city" label="City, state, ZIP">
                  <Input id="co-city" defaultValue="Springfield, IL 62701" />
                </Field>
                <Field id="co-tz" label="Time zone">
                  <Pick id="co-tz" value="Central time (Chicago)" options={["Central time (Chicago)", "Eastern time (New York)", "Mountain time (Denver)", "Pacific time (Los Angeles)"]} />
                </Field>
                <Field id="co-ind" label="Industry">
                  <Pick id="co-ind" value="LTL freight" options={["LTL freight", "Truckload", "Brokerage", "Warehousing"]} />
                </Field>
              </div>
            </Box>
            <Box title="Main contact" sub="Who Moneiva contacts about your account.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field id="pc-name" label="Name">
                  <Input id="pc-name" defaultValue="Taylor Morgan" />
                </Field>
                <Field id="pc-email" label="Email">
                  <Input id="pc-email" defaultValue="taylor@example.test" />
                </Field>
                <Field id="pc-phone" label="Phone">
                  <Input id="pc-phone" defaultValue="(555) 010-0100" />
                </Field>
              </div>
            </Box>
          </div>
        </TabsContent>

        <TabsContent value="signin" className="max-w-[760px]">
          <Box title="Sign-in" sub="How people get into Moneiva.">
            <Field id="dom" label="Allowed email domain">
              <Input id="dom" defaultValue="example.test" />
            </Field>
            <Toggle title="Single sign-on" sub="People sign in with your company account." on />
            <Toggle title="Require two-step sign-in" sub="For anyone without single sign-on." on={false} />
          </Box>
        </TabsContent>

        <TabsContent value="ai" className="max-w-[760px]">
          <Box title="AI rules and risk" sub="Limits that apply to every agent, whatever its stage.">
            <Toggle title="Never promise money" sub="Refunds, credits and rate changes always go to a person." on />
            <Toggle title="Say it's an AI assistant" sub="On calls and in the first email of a thread." on />
            <Toggle title="Hold anything with legal words" sub="Claims, lawsuits or attorneys go to Inbox." on />
          </Box>
        </TabsContent>
      </Tabs>
    </>
  )
}

function Box({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <Card className="gap-4 p-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-[13px] text-muted-foreground">{sub}</p>
      </div>
      {children}
    </Card>
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
function Days({ id, value }: { id: string; value: string }) {
  return (
    <div className="relative">
      <Input id={id} defaultValue={value} className="pr-12" inputMode="numeric" />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">days</span>
    </div>
  )
}
function Pick({ id, value, options }: { id: string; value: string; options: string[] }) {
  return (
    <Select defaultValue={value}>
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
function Toggle({ title, sub, on }: { title: string; sub: string; on: boolean }) {
  return (
    <label className="flex items-center justify-between gap-3 border-t pt-3 text-sm">
      <span className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-[13px] text-muted-foreground">{sub}</span>
      </span>
      <Switch defaultChecked={on} />
    </label>
  )
}
