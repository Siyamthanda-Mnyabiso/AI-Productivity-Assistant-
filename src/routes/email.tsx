import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Copy, Mail, Pencil, RefreshCw, Save, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEmail, wait } from "@/lib/ai-mock";
import { saveHistoryItem, takePrefill, useSettings } from "@/lib/store";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace" },
      { name: "description", content: "Create professional, context-aware emails in seconds with AI Workplace." },
      { property: "og:title", content: "Smart Email Generator — AI Workplace" },
      { property: "og:description", content: "Draft professional emails in seconds with AI assistance." },
    ],
  }),
  component: EmailPage,
});

const purposes = ["Project update", "Follow-up", "Meeting request", "Apology", "Request", "Thank you"];
const tones = ["Formal", "Friendly", "Persuasive"];
const lengths = ["Short", "Medium", "Detailed"];

function EmailPage() {
  const { settings } = useSettings();
  const [purpose, setPurpose] = useState(purposes[0]!);
  const [recipient, setRecipient] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("Friendly");
  const [length, setLength] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setTone(settings.defaultTone);
  }, [settings.defaultTone]);

  useEffect(() => {
    const p = takePrefill("email");
    if (!p) return;
    if (typeof p['purpose'] === "string") setPurpose(p['purpose']);
    if (typeof p['context'] === "string") setContext(p['context']);
    if (typeof p['recipient'] === "string") setRecipient(p['recipient']);
    toast.success("Template loaded");
  }, []);

  const run = async (regen = false) => {
    if (!context.trim()) {
      toast.error("Add some context so the AI knows what to write.");
      return;
    }
    setLoading(true);
    setEditing(false);
    await wait(900 + Math.random() * 600);
    setOutput(generateEmail({ purpose, recipient, context, tone, length }));
    setLoading(false);
    toast.success(regen ? "Regenerated a fresh version" : "Email generated");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const save = () => {
    const subject = output.split("\n")[0]?.replace(/^Subject:\s*/, "") ?? "Untitled email";
    saveHistoryItem({ tool: "email", toolLabel: "Smart Email Generator", title: subject, content: output });
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

        <PageHeader title="Smart Email Generator" subtitle="Create professional emails in seconds." icon={Mail} />

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email Purpose</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {purposes.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                className="rounded-xl"
                placeholder="e.g. Daniel Roberts"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="context">Context</Label>
            <Textarea
              id="context"
              rows={5}
              className="rounded-xl"
              placeholder="Explain what this email should communicate..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tone</Label>
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <Chip key={t} active={tone === t} onClick={() => setTone(t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Length</Label>
              <div className="flex flex-wrap gap-2">
                {lengths.map((l) => (
                  <Chip key={l} active={length === l} onClick={() => setLength(l)}>
                    {l}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          <Button className="mt-6 w-full rounded-xl sm:w-auto" onClick={() => run()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating..." : "Generate Email"}
          </Button>
        </div>

        {loading && !output && (
          <div className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-6 shadow-soft">
            {[90, 70, 80, 60].map((w, i) => (
              <div key={i} className="h-3 animate-pulse rounded-full bg-secondary" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {output && (
          <div className="mt-6 rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber" />
              <p className="text-sm font-semibold">Generated email</p>
              <span className="ml-auto text-xs text-muted-foreground">
                {tone} · {length}
              </span>
            </div>
            {editing ? (
              <Textarea
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                rows={16}
                className="rounded-none border-0 font-mono text-sm focus-visible:ring-0"
              />
            ) : (
              <pre className="whitespace-pre-wrap px-5 py-5 text-sm leading-relaxed text-foreground">{output}</pre>
            )}
            <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={copy}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => run(true)} disabled={loading}>
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setEditing((v) => !v)}>
                <Pencil className="h-4 w-4" /> {editing ? "Done" : "Edit"}
              </Button>
              <Button size="sm" className="rounded-xl" onClick={save}>
                <Save className="h-4 w-4" /> Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
        (active
          ? "border-primary bg-brand-soft text-primary"
          : "border-border bg-card text-muted-foreground hover:bg-secondary")
      }
    >
      {children}
    </button>
  );
}
