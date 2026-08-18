import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  ClipboardCheck,
  FileText,
  Mail,
  Shield,
  ArrowRight,
  CalendarClock,
  Upload,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useHistory, useSettings, timeAgo, type ToolKey } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace — Productivity Assistant Dashboard" },
      {
        name: "description",
        content:
          "AI Workplace helps you draft emails, summarize meeting notes and plan tasks with an AI productivity assistant.",
      },
      { property: "og:title", content: "AI Workplace — Productivity Assistant Dashboard" },
      {
        property: "og:description",
        content: "Draft emails, summarize meetings and plan your day with AI Workplace.",
      },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    desc: "Create professional, context-aware emails in seconds.",
    cta: "Create Email",
    accent: "brand",
  },
  {
    to: "/notes",
    icon: FileText,
    title: "Meeting Notes Summarizer",
    desc: "Summarize meetings and extract action items instantly.",
    cta: "Summarize Notes",
    accent: "teal",
  },
  {
    to: "/tasks",
    icon: ClipboardCheck,
    title: "AI Task Planner",
    desc: "Plan, prioritize and organize tasks with AI assistance.",
    cta: "Plan Tasks",
    accent: "amber",
  },
] as const;

const accentClass = {
  brand: { chip: "bg-brand-soft text-primary", ring: "hover:border-primary/40", bar: "bg-brand" },
  teal: { chip: "bg-teal-soft text-teal", ring: "hover:border-teal/40", bar: "bg-teal" },
  amber: { chip: "bg-amber-soft text-amber", ring: "hover:border-amber/50", bar: "bg-amber" },
} as const;

const seedActivity = [
  { title: "Project Update Email", toolLabel: "Smart Email Generator", when: "2m ago" },
  { title: "Team Sync Notes", toolLabel: "Meeting Notes Summarizer", when: "1h ago" },
  { title: "Marketing Plan Tasks", toolLabel: "AI Task Planner", when: "3h ago" },
];

const quickActions: { title: string; desc: string; to: string; icon: typeof Mail }[] = [
  { title: "New Email", desc: "Create a professional email with AI assistance.", to: "/email", icon: Mail },
  { title: "Upload Notes", desc: "Turn meeting notes into a concise summary.", to: "/notes", icon: Upload },
  { title: "Plan My Day", desc: "Turn today's tasks into an organized schedule.", to: "/tasks", icon: CalendarClock },
];

const usageDays = [
  { day: "M", v: 4 },
  { day: "T", v: 6 },
  { day: "W", v: 3 },
  { day: "T", v: 7 },
  { day: "F", v: 2 },
  { day: "S", v: 1 },
  { day: "S", v: 1 },
];

function Dashboard() {
  const { settings } = useSettings();
  const history = useHistory();
  const navigate = useNavigate();
  const first = settings.name.split(" ")[0];
  const used = 24 + history.length;
  const max = Math.max(...usageDays.map((d) => d.v));

  const activity = history.length
    ? history.slice(0, 6).map((h) => ({ title: h.title, toolLabel: h.toolLabel, when: timeAgo(h.createdAt) }))
    : seedActivity;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-5 py-10 shadow-soft sm:px-10 sm:py-14">
          <div className="aurora">
            <span className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-brand/25 blur-[90px]" />
            <span className="absolute -right-10 top-0 h-56 w-56 rounded-full bg-teal/25 blur-[90px]" />
            <span className="absolute bottom-[-90px] left-1/3 h-56 w-56 rounded-full bg-amber/25 blur-[90px]" />
          </div>
          <div className="relative">
            <p className="text-sm font-medium text-muted-foreground">Welcome back, {first} 👋</p>
            <h1 className="mt-3 max-w-3xl text-[26px] font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
              How can I help you be more productive today?
            </h1>
          </div>
        </section>

        {/* Tools */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => {
            const a = accentClass[t.accent];
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift",
                  a.ring,
                )}
              >
                <span className={cn("grid h-11 w-11 place-items-center rounded-xl", a.chip)}>
                  <t.icon className="h-[22px] w-[22px]" />
                </span>
                <h2 className="mt-4 text-base font-semibold">{t.title}</h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {t.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {/* Recent activity */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold">Recent Activity</h2>
                <p className="text-sm text-muted-foreground">Your latest AI-generated content</p>
              </div>
              <Link to="/history" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                View all history <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {activity.map((a, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-muted-foreground">
                    {a.toolLabel.includes("Email") ? (
                      <Mail className="h-4 w-4" />
                    ) : a.toolLabel.includes("Meeting") ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <ClipboardCheck className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.toolLabel} · {a.when}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
                    Completed
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-4">
            {/* Quick actions */}
            <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="text-base font-semibold">Quick Actions</h2>
              <div className="mt-3 flex flex-col gap-1">
                {quickActions.map((q) => (
                  <button
                    key={q.title}
                    onClick={() => navigate({ to: q.to })}
                    className="flex items-center gap-3 rounded-xl px-2.5 py-3 text-left transition-colors hover:bg-secondary"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-primary">
                      <q.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{q.title}</span>
                      <span className="block text-xs leading-snug text-muted-foreground">{q.desc}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </section>

            {/* Usage */}
            <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="text-base font-semibold">AI Usage This Week</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{used} / 100</span> generations used
              </p>
              <Progress value={used} className="mt-3 h-2" />
              <div className="mt-5 flex h-20 items-end gap-2">
                {usageDays.map((d, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-md bg-brand/70 transition-all"
                      style={{ height: `${Math.max(8, (d.v / max) * 56)}px` }}
                    />
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Responsible AI */}
        <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-secondary/50 p-5 sm:flex-row sm:items-start">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-card text-muted-foreground">
            <Shield className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Responsible AI</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              AI-generated content may be inaccurate or incomplete. Please review the output carefully before use and do
              not share sensitive information.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="self-start rounded-xl" asChild>
            <Link to="/settings">Learn more</Link>
          </Button>
        </section>
      </div>
    </AppShell>
  );
}
