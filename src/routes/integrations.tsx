import { createFileRoute } from "@tanstack/react-router";
import { Calendar, HardDrive, Mail, MessageSquare, Plug, Inbox } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — AI Workplace" },
      { name: "description", content: "Connect calendar, email, chat and storage tools to your AI workspace." },
      { property: "og:title", content: "Integrations — AI Workplace" },
      { property: "og:description", content: "Connect the tools your team already uses." },
    ],
  }),
  component: IntegrationsPage,
});

const integrations = [
  { name: "Google Calendar", desc: "Manage schedules and meetings.", icon: Calendar, accent: "bg-brand-soft text-primary" },
  { name: "Gmail", desc: "Work with email productivity workflows.", icon: Mail, accent: "bg-amber-soft text-amber" },
  { name: "Microsoft Outlook", desc: "Connect workplace communication.", icon: Inbox, accent: "bg-teal-soft text-teal" },
  { name: "Slack", desc: "Bring productivity workflows into team communication.", icon: MessageSquare, accent: "bg-brand-soft text-primary" },
  { name: "Google Drive", desc: "Work with documents and meeting materials.", icon: HardDrive, accent: "bg-teal-soft text-teal" },
];

function IntegrationsPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader title="Integrations" subtitle="Connect the tools your team already uses." icon={Plug} accent="teal" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((i) => (
            <div key={i.name} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft">
              <span className={`grid h-11 w-11 place-items-center rounded-xl ${i.accent}`}>
                <i.icon className="h-[22px] w-[22px]" />
              </span>
              <p className="mt-4 text-sm font-semibold">{i.name}</p>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">{i.desc}</p>
              <Button
                variant="outline"
                className="mt-4 rounded-xl"
                onClick={() => toast("Integration coming soon.")}
              >
                Connect
              </Button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
