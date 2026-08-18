import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ClipboardCheck,
  FileText,
  History,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  Menu,
  Plug,
  Settings,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const mainNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Smart Email", icon: Mail },
  { to: "/notes", label: "Meeting Notes", icon: FileText },
  { to: "/tasks", label: "AI Task Planner", icon: ClipboardCheck },
] as const;

const secondaryNav = [
  { to: "/history", label: "History", icon: History },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const bottomNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email", icon: Mail },
  { to: "/notes", label: "Notes", icon: FileText },
  { to: "/tasks", label: "Tasks", icon: ClipboardCheck },
  { to: "/history", label: "History", icon: History },
] as const;

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full text-primary-foreground"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, var(--brand), var(--teal))",
        boxShadow: "0 6px 16px -6px var(--brand)",
      }}
    >
      <Sparkles style={{ width: size * 0.5, height: size * 0.5 }} strokeWidth={2.2} />
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const item = (to: string, label: string, Icon: typeof Mail) => {
    const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
    return (
      <Link
        key={to}
        to={to}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-brand-soft text-primary"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
        {label}
      </Link>
    );
  };

  return (
    <nav className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Main</p>
        {mainNav.map((n) => item(n.to, n.label, n.icon))}
      </div>
      <div className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Workspace</p>
        {secondaryNav.map((n) => item(n.to, n.label, n.icon))}
      </div>
    </nav>
  );
}

function UpgradeCard() {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-brand-soft to-teal-soft p-4">
      <p className="text-sm font-semibold text-foreground">Upgrade to Pro</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        Unlock unlimited AI generations, custom templates and more.
      </p>
      <Button
        size="sm"
        className="mt-3 w-full rounded-xl"
        onClick={() => toast("Pro plans are coming soon.")}
      >
        Upgrade Now
      </Button>
    </div>
  );
}

function ProfileRow() {
  const { settings } = useSettings();
  const initials = settings.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
  return (
    <Link
      to="/settings"
      className="flex items-center gap-3 rounded-xl border border-border p-2.5 transition-colors hover:bg-secondary"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-primary">
        {initials}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{settings.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{settings.email}</span>
      </span>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/" onClick={onNavigate} className="flex items-center gap-3 px-2 pt-1">
        <Logo />
        <span>
          <span className="block text-[15px] font-bold leading-tight">AI Workplace</span>
          <span className="block text-xs text-muted-foreground">Productivity Assistant</span>
        </span>
      </Link>
      <div className="flex-1 overflow-y-auto">
        <NavList onNavigate={onNavigate} />
      </div>
      <div className="flex flex-col gap-3">
        <UpgradeCard />
        <ProfileRow />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl lg:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[292px] max-w-[86vw] p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarContent onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-2 lg:hidden">
              <Logo size={30} />
              <span className="text-sm font-bold">AI Workplace</span>
            </Link>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-xl"
                aria-label="Notifications"
                onClick={() => toast("You're all caught up.")}
              >
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber" />
              </Button>
              <Button className="rounded-xl" onClick={() => toast("Pro plans are coming soon.")}>
                Upgrade
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-16">{children}</main>
      </div>

      <MobileTabBar />
    </div>
  );
}

function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {bottomNav.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  accent = "brand",
}: {
  title: string;
  subtitle: string;
  icon: typeof Mail;
  accent?: "brand" | "teal" | "amber";
}) {
  const bg = { brand: "bg-brand-soft text-primary", teal: "bg-teal-soft text-teal", amber: "bg-amber-soft text-amber" }[accent];
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", bg)}>
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
