import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Workplace" },
      { name: "description", content: "Manage your profile, preferences and AI defaults in AI Workplace." },
      { property: "og:title", content: "Settings — AI Workplace" },
      { property: "og:description", content: "Profile, preferences and AI defaults." },
    ],
  }),
  component: SettingsPage,
});

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-soft sm:p-6">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4 space-y-5">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SettingsPage() {
  const { settings, update } = useSettings();

  const set = (patch: Parameters<typeof update>[0], message: string) => {
    update(patch);
    toast.success(message);
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <PageHeader title="Settings" subtitle="Manage your profile and AI preferences." icon={SettingsIcon} />

        <Card title="Profile">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              className="rounded-xl"
              value={settings.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="rounded-xl"
              value={settings.email}
              onChange={(e) => update({ email: e.target.value })}
            />
          </div>
        </Card>

        <Card title="Preferences">
          <Toggle
            label="Dark mode"
            desc="Switch the workspace to a darker theme."
            checked={settings.darkMode}
            onChange={(v) => set({ darkMode: v }, v ? "Dark mode on" : "Dark mode off")}
          />
          <Toggle
            label="Email notifications"
            desc="Get a summary of your AI activity by email."
            checked={settings.emailNotifications}
            onChange={(v) => set({ emailNotifications: v }, "Preference saved")}
          />
          <Toggle
            label="AI suggestions"
            desc="Show contextual suggestions while you write."
            checked={settings.aiSuggestions}
            onChange={(v) => set({ aiSuggestions: v }, "Preference saved")}
          />
        </Card>

        <Card title="AI Preferences">
          <div className="space-y-2">
            <Label>Default email tone</Label>
            <Select value={settings.defaultTone} onValueChange={(v) => set({ defaultTone: v }, "Default tone updated")}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Formal", "Friendly", "Persuasive"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default task priority</Label>
            <Select
              value={settings.defaultPriority}
              onValueChange={(v) => set({ defaultPriority: v }, "Default priority updated")}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Low", "Medium", "High"].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
