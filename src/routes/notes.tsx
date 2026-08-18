import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Copy, FileText, Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeNotes, summaryToText, wait, type NotesSummary } from "@/lib/ai-mock";
import { saveHistoryItem, takePrefill } from "@/lib/store";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace" },
      { name: "description", content: "Turn long meeting notes into clear summaries, decisions and action items." },
      { property: "og:title", content: "Meeting Notes Summarizer — AI Workplace" },
      { property: "og:description", content: "Summarize meetings and extract action items instantly." },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NotesSummary | null>(null);

  useEffect(() => {
    const p = takePrefill("notes");
    if (!p) return;
    if (typeof p['title'] === "string") setTitle(p['title']);
    if (typeof p['notes'] === "string") setNotes(p['notes']);
    toast.success("Template loaded");
  }, []);

  const run = async (regen = false) => {
    if (notes.trim().length < 20) {
      toast.error("Paste a few lines of meeting notes first.");
      return;
    }
    setLoading(true);
    await wait(1000 + Math.random() * 600);
    setResult(summarizeNotes(notes, title, date));
    setLoading(false);
    toast.success(regen ? "Summary regenerated" : "Summary ready");
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(summaryToText(result));
    toast.success("Summary copied");
  };

  const save = () => {
    if (!result) return;
    saveHistoryItem({
      tool: "notes",
      toolLabel: "Meeting Notes Summarizer",
      title: result.title,
      content: summaryToText(result),
    });
    toast.success("Saved to History");
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2 rounded-xl" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>

        <PageHeader
          title="Meeting Notes Summarizer"
          subtitle="Turn long meeting notes into clear, actionable summaries."
          icon={FileText}
          accent="teal"
        />

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mtitle">Meeting Title</Label>
              <Input
                id="mtitle"
                className="rounded-xl"
                placeholder="Weekly team sync"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mdate">Meeting Date</Label>
              <Input
                id="mdate"
                type="date"
                className="rounded-xl"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <Label htmlFor="mnotes">Meeting Notes</Label>
            <Textarea
              id="mnotes"
              rows={9}
              className="rounded-xl"
              placeholder="Paste your meeting notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button className="mt-6 w-full rounded-xl sm:w-auto" onClick={() => run()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Summarizing..." : "Summarize Notes"}
          </Button>
        </div>

        {loading && (
          <div className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-6 shadow-soft">
            {[80, 95, 65, 88].map((w, i) => (
              <div key={i} className="h-3 animate-pulse rounded-full bg-secondary" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {!loading && result && (
          <div className="mt-6 space-y-4">
            <Section title="Summary">
              <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
            </Section>

            <Section title="Key Decisions">
              <ul className="space-y-2">
                {result.decisions.map((d, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                    <span className="text-muted-foreground">{d}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Action Items">
              <div className="space-y-2">
                {result.actions.map((a, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center"
                  >
                    <p className="min-w-0 flex-1 text-sm font-medium">{a.task}</p>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                        {a.owner}
                      </span>
                      <span className="rounded-full bg-amber-soft px-2.5 py-1 text-[11px] font-semibold text-amber">
                        {a.deadline}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Important Topics">
              <div className="flex flex-wrap gap-2">
                {result.topics.map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </Section>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={copy}>
                <Copy className="h-4 w-4" /> Copy Summary
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => run(true)}>
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
              <Button size="sm" className="rounded-xl" onClick={save}>
                <Save className="h-4 w-4" /> Save Notes
              </Button>
            </div>
          </div>
        )}

        {!loading && !result && (
          <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Your summary, decisions and action items will appear here.
          </p>
        )}
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}
