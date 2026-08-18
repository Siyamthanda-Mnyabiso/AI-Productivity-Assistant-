import { useCallback, useEffect, useState } from "react";

export type ToolKey = "email" | "notes" | "tasks";

export type HistoryItem = {
  id: string;
  tool: ToolKey;
  toolLabel: string;
  title: string;
  createdAt: number;
  status: "Completed";
  content: string;
  payload?: unknown;
};

export type Settings = {
  name: string;
  email: string;
  darkMode: boolean;
  emailNotifications: boolean;
  aiSuggestions: boolean;
  defaultTone: string;
  defaultPriority: string;
};

export const defaultSettings: Settings = {
  name: "Emily Johnson",
  email: "emily@example.com",
  darkMode: false,
  emailNotifications: true,
  aiSuggestions: true,
  defaultTone: "Friendly",
  defaultPriority: "Medium",
};

const HISTORY_KEY = "aiw.history";
const SETTINGS_KEY = "aiw.settings";
const PREFILL_KEY = "aiw.prefill";

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...(fallback as object), ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function emit(key: string) {
  window.dispatchEvent(new CustomEvent("aiw:store", { detail: key }));
}

/* ----------------------------- history ----------------------------- */

export function loadHistory(): HistoryItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: Omit<HistoryItem, "id" | "createdAt" | "status">) {
  const next: HistoryItem = {
    ...item,
    id: Math.random().toString(36).slice(2),
    createdAt: Date.now(),
    status: "Completed",
  };
  const all = [next, ...loadHistory()].slice(0, 100);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
  emit(HISTORY_KEY);
  return next;
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    const sync = () => setItems(loadHistory());
    sync();
    window.addEventListener("aiw:store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("aiw:store", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return items;
}

/* ----------------------------- settings ----------------------------- */

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    const sync = () => setSettings(read(SETTINGS_KEY, defaultSettings));
    sync();
    window.addEventListener("aiw:store", sync);
    return () => window.removeEventListener("aiw:store", sync);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode]);

  const update = useCallback((patch: Partial<Settings>) => {
    const next = { ...read(SETTINGS_KEY, defaultSettings), ...patch };
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    emit(SETTINGS_KEY);
  }, []);

  return { settings, update };
}

/* ----------------------------- prefill ----------------------------- */

export function setPrefill(tool: ToolKey, data: Record<string, unknown>) {
  if (!isBrowser()) return;
  window.sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ tool, data }));
}

export function takePrefill(tool: ToolKey): Record<string, unknown> | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.sessionStorage.getItem(PREFILL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { tool: ToolKey; data: Record<string, unknown> };
    if (parsed.tool !== tool) return null;
    window.sessionStorage.removeItem(PREFILL_KEY);
    return parsed.data;
  } catch {
    return null;
  }
}

/* ----------------------------- misc ----------------------------- */

export function timeAgo(ts: number) {
  const diff = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}
