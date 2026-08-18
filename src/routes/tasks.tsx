import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck, Loader2, Plus, RefreshCw, Save, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Chip } from "./email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { generatePlan, planToText, wait, type PlanTask, type TaskInput } from "@/lib/ai-mock";
import { saveHistoryItem, takePrefill, useSettings } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace" },
      { name: "description", content: "Turn your goals into an organized, prioritized daily plan with AI." },
      { property: "og:title", content: "AI Task Planner — AI Workplace" },
      { property: "og:description", content: "Plan, prioritize and organize tasks with AI assistance." },
    ],
  }),
  component: TasksPage,
});

const PLAN_KEY = "aiw.plan";
const priorities = ["Low", "Medium", "High"];
const schedules = ["Today", "This Week"];

function TasksPage() {
  const { settings } = useSettings();
  const [tasks, setTasks] = useState<TaskInput[]>([]);
  const [draft, setDraft] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [schedule, setSchedule] = useState("Today");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanTask[]>([]);

  useEffect(() => setPriority(settings.defaultPriority), [settings.defaultPriority]);

  useEffect(() => {
    const saved = window.localStorage.getItem(PLAN_KEY);
    if (saved) {
      try {
        setPlan(JSON.parse(saved) as PlanTask[]);
      } catch {
        /* ignore */
      }
    }
    const p = takePrefill("tasks");
    if (p && Array.isArray(p['tasks'])) {
      setTasks(
        (p['tasks'] as string[]).map((name) => ({ name, priority: "Medium", schedule: "Today" })),
      );
      toast.success("Template loaded");
    }
  }, []);

  const persist = (next: PlanTask[]) => {
    setPlan(next);
    window.localStorage.setItem(PLAN_KEY, JSON.stringify(next));
  };

  const addTask = () => {
    if (!draft.trim()) return;
    setTasks((t) => [...t, { name: draft.trim(), priority, schedule }]);
    setDraft("");
  };

  const run = async (regen = false) => {
    if (!tasks.length) {
      toast.error("Add at least one task first.");
      return;
    }
    setLoading(true);
    await wait(900 + Math.random() * 600);
    persist(generatePlan(tasks));
    setLoading(false);
    toast.success(regen ? "Plan regenerated" : "Your plan is ready");
  };

  const toggle = (id: string) => persist(plan.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const save = () => {
    if (!plan.length) return;
    saveHistoryItem({
      tool: "tasks",
      toolLabel: "AI Task Planner",
      title: `Plan · ${plan.length} tasks`,
      content: planToText(plan),
    });
    toast.success("Saved to History");
  };

  const done = plan.filter((t) => t.done).length;
  const pct = plan.length ? Math.round((done / plan.length) * 100) : 0;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 rounded-xl" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>

        <PageHeader
          title="AI Task Planner"
          subtitle="Turn your goals into an organized plan."
          icon={ClipboardCheck}
          accent="amber"
        />

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <Label htmlFor="task">Your tasks</Label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              id="task"
              className="rounded-xl"
              placeholder="e.g. Finish project report"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <Button className="rounded-xl" onClick={addTask}>
              <Plus className="h-4 w-4" /> Add task
            </Button>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Priority</Label>
              <div className="flex flex-wrap gap-2">
                {priorities.map((p) => (
                  <Chip key={p} active={priority === p} onClick={() => setPriority(p)}>
                    {p}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Schedule</Label>
              <div className="flex flex-wrap gap-2">
                {schedules.map((s) => (
                  <Chip key={s} active={schedule === s} onClick={() => setSchedule(s)}>
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          {tasks.length > 0 && (
            <ul className="mt-5 space-y-2">
              {tasks.map((t, i) => (
                <li key={i} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{t.name}</span>
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    {t.priority} · {t.schedule}
                  </span>
                  <button
                    aria-label="Remove task"
                    onClick={() => setTasks((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Button className="mt-6 w-full rounded-xl sm:w-auto" onClick={() => run()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Planning..." : "Generate My Plan"}
          </Button>
        </div>

        {plan.length > 0 && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Today's Plan</h2>
              <span className="text-sm text-muted-foreground">
                {done} of {plan.length} complete
              </span>
            </div>
            <Progress value={pct} className="mt-3 h-2" />

            <ul className="mt-5 space-y-2">
              {plan.map((t) => (
                <li
                  key={t.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border border-border p-3.5 transition-colors",
                    t.done && "bg-secondary/60",
                  )}
                >
                  <Checkbox checked={t.done} onCheckedChange={() => toggle(t.id)} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-medium", t.done && "text-muted-foreground line-through")}>{t.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.time} · {t.duration}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      t.priority === "High"
                        ? "bg-amber-soft text-amber"
                        : t.priority === "Medium"
                          ? "bg-brand-soft text-primary"
                          : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {t.priority}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => run(true)}>
                <RefreshCw className="h-4 w-4" /> Regenerate Plan
              </Button>
              <Button size="sm" className="rounded-xl" onClick={save}>
                <Save className="h-4 w-4" /> Save Plan
              </Button>
            </div>
          </section>
        )}

        {!plan.length && !loading && (
          <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Add your tasks above and generate a schedule for the day.
          </p>
        )}
      </div>
    </AppShell>
  );
}
