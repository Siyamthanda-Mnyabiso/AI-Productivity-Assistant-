import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ClipboardCheck, FileText, LayoutTemplate, Mail } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { setPrefill, type ToolKey } from "@/lib/store";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Templates — AI Workplace" },
      { name: "description", content: "Reusable email, meeting and task planner templates that pre-fill each AI tool." },
      { property: "og:title", content: "Templates — AI Workplace" },
      { property: "og:description", content: "Start faster with ready-made productivity templates." },
    ],
  }),
  component: TemplatesPage,
});

type Tpl = { name: string; desc: string; tool: ToolKey; data: Record<string, unknown> };

const groups: { heading: string; icon: typeof Mail; accent: string; items: Tpl[] }[] = [
  {
    heading: "Email Templates",
    icon: Mail,
    accent: "bg-brand-soft text-primary",
    items: [
      {
        name: "Project Update",
        desc: "Share progress, risks and next milestones with stakeholders.",
        tool: "email",
        data: { purpose: "Project update", context: "Sprint 4 finished on time. Design handover is complete and QA starts Monday. One risk: the analytics integration may slip by two days." },
      },
      {
        name: "Meeting Follow-up",
        desc: "Recap what was agreed and confirm the next steps.",
        tool: "email",
        data: { purpose: "Follow-up", context: "Recap of our call: we agreed on scope, budget and a review date. I'll send the revised timeline tomorrow." },
      },
      {
        name: "Client Introduction",
        desc: "Introduce yourself and your team to a new client.",
        tool: "email",
        data: { purpose: "Request", context: "Introducing myself as your new account lead and asking for a short kickoff call to align on goals." },
      },
      {
        name: "Thank You",
        desc: "Show appreciation after support, a meeting or a referral.",
        tool: "email",
        data: { purpose: "Thank you", context: "Thanks for making time yesterday and for the detailed feedback on the proposal." },
      },
      {
        name: "Request",
        desc: "Ask for information, approval or a resource.",
        tool: "email",
        data: { purpose: "Request", context: "Requesting sign-off on the revised budget so procurement can move forward this week." },
      },
    ],
  },
  {
    heading: "Meeting Templates",
    icon: FileText,
    accent: "bg-teal-soft text-teal",
    items: [
      {
        name: "Weekly Team Meeting",
        desc: "Standing agenda for status, blockers and priorities.",
        tool: "notes",
        data: {
          title: "Weekly Team Meeting",
          notes: "Sarah shared sprint progress, 8 of 10 tickets done.\nWe decided to move the reporting feature to next sprint.\nDaniel will prepare the QA checklist by Friday.\nBlocker: staging environment is unstable.\nWe agreed to review analytics requirements next Monday.",
        },
      },
      {
        name: "Client Meeting",
        desc: "Capture client requests, decisions and commitments.",
        tool: "notes",
        data: {
          title: "Client Meeting",
          notes: "Client approved the new onboarding flow.\nThey need pricing options by next week.\nMaria will send the revised contract on Tuesday.\nWe decided to keep the current launch date.",
        },
      },
      {
        name: "Project Review",
        desc: "Summarize outcomes, risks and follow-up owners.",
        tool: "notes",
        data: {
          title: "Project Review",
          notes: "Phase one delivered on schedule.\nWe agreed to reallocate two engineers to the mobile track.\nJames will draft the risk register by end of week.\nBudget review confirmed for next Monday.",
        },
      },
    ],
  },
  {
    heading: "Task Planner Templates",
    icon: ClipboardCheck,
    accent: "bg-amber-soft text-amber",
    items: [
      {
        name: "Work Day",
        desc: "A balanced day of deep work, admin and communication.",
        tool: "tasks",
        data: { tasks: ["Finish project report", "Reply to emails", "Team stand-up", "Review pull requests"] },
      },
      {
        name: "Study Day",
        desc: "Focused study blocks with breaks and revision.",
        tool: "tasks",
        data: { tasks: ["Study for database test", "Summarize lecture notes", "Practice past papers", "Revise key concepts"] },
      },
      {
        name: "Project Sprint",
        desc: "Ship a milestone with planning, building and review.",
        tool: "tasks",
        data: { tasks: ["Plan sprint scope", "Prepare presentation", "Build core feature", "Run QA pass", "Write release notes"] },
      },
    ],
  },
];

const routeFor = { email: "/email", notes: "/notes", tasks: "/tasks" } as const;

function TemplatesPage() {
  const navigate = useNavigate();

  const use = (t: Tpl) => {
    setPrefill(t.tool, t.data);
    navigate({ to: routeFor[t.tool] });
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader title="Templates" subtitle="Start from a proven structure and let AI do the rest." icon={LayoutTemplate} />

        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.heading}>
              <div className="mb-3 flex items-center gap-2.5">
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${g.accent}`}>
                  <g.icon className="h-4 w-4" />
                </span>
                <h2 className="text-base font-semibold">{g.heading}</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => use(t)}
                    className="group flex flex-col rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">{t.desc}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                      Use template
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
