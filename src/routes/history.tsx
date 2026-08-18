import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, Copy, FileText, History as HistoryIcon, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Chip } from "./email";
import { timeAgo, useHistory, type HistoryItem, type ToolKey } from "@/lib/store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — AI Workplace" },
      { name: "description", content: "Browse every email, meeting summary and task plan you generated." },
      { property: "og:title", content: "History — AI Workplace" },
      { property: "og:description", content: "Your saved AI-generated emails, summaries and plans." },
    ],
  }),
  component: HistoryPage,
});

const filters: { label: string; value: "all" | ToolKey }[] = [
  { label: "All", value: "all" },
  { label: "Emails", value: "email" },
  { label: "Notes", value: "notes" },
  { label: "Tasks", value: "tasks" },
];

const iconFor = { email: Mail, notes: FileText, tasks: ClipboardCheck };

function HistoryPage() {
  const items = useHistory();
  const [filter, setFilter] = useState<"all" | ToolKey>("all");
  const [open, setOpen] = useState<HistoryItem | null>(null);

  const visible = filter === "all" ? items : items.filter((i) => i.tool === filter);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader title="History" subtitle="Everything you've generated and saved." icon={HistoryIcon} />

        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((f) => (
            <Chip key={f.value} active={filter === f.value} onClick={() => setFilter(f.value)}>
              {f.label}
            </Chip>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm font-semibold">Nothing saved yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate an email, summary or task plan and save it — it will show up here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {visible.map((item) => {
              const Icon = iconFor[item.tool];
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setOpen(item)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-colors hover:bg-secondary/50"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-primary">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{item.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.toolLabel} · {timeAgo(item.createdAt)}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
                      {item.status}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
          <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="pr-6 text-left">{open?.title}</DialogTitle>
            </DialogHeader>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{open?.content}</pre>
            <Button
              variant="outline"
              className="mt-2 self-start rounded-xl"
              onClick={async () => {
                await navigator.clipboard.writeText(open?.content ?? "");
                toast.success("Copied to clipboard");
              }}
            >
              <Copy className="h-4 w-4" /> Copy
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
