/* Deterministic-ish but varied mock "AI" generators. */

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;

const capital = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function wait(ms = 1100) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ------------------------------ email ------------------------------ */

export type EmailInput = {
  purpose: string;
  recipient: string;
  context: string;
  tone: string;
  length: string;
};

export function generateEmail({ purpose, recipient, context, tone, length }: EmailInput) {
  const name = recipient.trim() || "there";
  const first = name.split(" ")[0] || name;
  const ctx = context.trim();
  const ctxSentence = ctx ? (ctx.endsWith(".") ? ctx : `${ctx}.`) : "";

  const greeting =
    tone === "Formal" ? `Dear ${capital(name)},` : tone === "Persuasive" ? `Hi ${capital(first)},` : `Hey ${capital(first)},`;

  const openers: Record<string, string[]> = {
    Formal: [
      "I hope this message finds you well.",
      "I trust you are doing well.",
      "Thank you for your time and attention on this matter.",
    ],
    Friendly: ["Hope your week is going well!", "Quick note from my side today.", "Hope you're doing great!"],
    Persuasive: [
      "I wanted to reach out with something I think will genuinely move the needle for you.",
      "I'll keep this short because I think the opportunity here speaks for itself.",
      "There's a small change we can make that I believe will pay off quickly.",
    ],
  };

  const bodies: Record<string, (c: string) => string> = {
    "Project update": (c) =>
      `Here's where things currently stand.${c ? ` ${c}` : " The team has made steady progress across the main workstreams this week."} Overall we remain on track against the agreed milestones, and I'll flag any risks as soon as they appear.`,
    "Follow-up": (c) =>
      `I'm following up on our last conversation.${c ? ` ${c}` : " I wanted to make sure nothing slipped through the cracks on our side."} Let me know if anything has changed on your end, and I'll adjust accordingly.`,
    "Meeting request": (c) =>
      `I'd like to set up a short meeting to align on next steps.${c ? ` ${c}` : ""} Would 30 minutes later this week work for you? I'm happy to work around your calendar.`,
    Apology: (c) =>
      `I want to apologise for the recent slip on our side.${c ? ` ${c}` : " The delay was avoidable, and I take responsibility for it."} We've already adjusted our process so this doesn't happen again.`,
    Request: (c) =>
      `I have a small request that would really help us move forward.${c ? ` ${c}` : ""} If you're able to help, it would unblock the next stage of work for the team.`,
    "Thank you": (c) =>
      `I wanted to say a genuine thank you.${c ? ` ${c}` : " Your support made a real difference to how smoothly this went."} It's very much appreciated by everyone involved.`,
  };

  const extra: Record<string, string[]> = {
    Formal: [
      "Should you require any further detail, I would be glad to provide it.",
      "Please do let me know if any clarification would be helpful.",
    ],
    Friendly: ["Shout if you want more detail — happy to walk you through it.", "Let me know what you think!"],
    Persuasive: [
      "If we act on this in the next week, we'll capture the full benefit this quarter.",
      "I'd love just fifteen minutes to show you what this looks like in practice.",
    ],
  };

  const closers: Record<string, string> = {
    Formal: "Kind regards,",
    Friendly: "Thanks so much,",
    Persuasive: "Looking forward to your thoughts,",
  };

  const subjectBase: Record<string, string> = {
    "Project update": "Project update",
    "Follow-up": "Following up",
    "Meeting request": "Quick meeting request",
    Apology: "Apologies and next steps",
    Request: "A quick request",
    "Thank you": "Thank you",
  };

  const hint = ctx ? ctx.split(/[.,\n]/)[0]!.trim().slice(0, 42) : "";
  const subject = `${subjectBase[purpose] ?? "Quick note"}${hint ? ` — ${hint}` : ""}`;

  const paragraphs = [pick(openers[tone] ?? openers.Friendly!), (bodies[purpose] ?? bodies["Follow-up"]!)(ctxSentence)];

  if (length === "Medium" || length === "Detailed") paragraphs.push(pick(extra[tone] ?? extra.Friendly!));
  if (length === "Detailed") {
    paragraphs.push(
      `To summarise the next steps: I'll circulate a short recap, we'll confirm owners for each item, and we'll review progress at the end of the week. If you'd prefer a different cadence, just say the word and I'll rework the plan around what suits you best.`,
    );
  }
  if (length === "Short") paragraphs.length = 2;

  return `Subject: ${subject}\n\n${greeting}\n\n${paragraphs.join("\n\n")}\n\n${closers[tone] ?? "Best,"}\nEmily Johnson`;
}

/* ------------------------------ notes ------------------------------ */

export type NotesSummary = {
  title: string;
  summary: string;
  decisions: string[];
  actions: { task: string; owner: string; deadline: string }[];
  topics: string[];
};

const NAME_RE = /\b([A-Z][a-z]{2,11})\b/g;
const STOP = new Set([
  "The","This","That","We","They","I","Our","Their","Monday","Tuesday","Wednesday","Thursday","Friday","Next","Team","Meeting","Notes","Action","Decision","And","But","After","Before","Also","Project","Review","Please","Should","Will","Need",
]);

export function summarizeNotes(notes: string, title: string, date: string): NotesSummary {
  const clean = notes.trim();
  const lines = clean
    .split(/\n|(?<=\.)\s+/)
    .map((l) => l.replace(/^[-*•\d.\s]+/, "").trim())
    .filter((l) => l.length > 3);

  const people = Array.from(new Set(Array.from(clean.matchAll(NAME_RE)).map((m) => m[1]!)))
    .filter((n) => !STOP.has(n))
    .slice(0, 5);

  const owners = people.length ? people : ["Emily", "Team lead", "Unassigned"];

  const decisionLines = lines.filter((l) => /decid|agree|approv|sign off|confirm|chose|will go with/i.test(l));
  const actionLines = lines.filter((l) => /will |need to|action|todo|to-do|follow up|send|prepare|draft|review|ship|deliver/i.test(l));
  const deadlineIn = (l: string) => {
    const m = l.match(/\b(monday|tuesday|wednesday|thursday|friday|next week|this week|end of (?:the )?week|tomorrow|\d{1,2}\s\w+)\b/i);
    return m ? capital(m[1]!) : pick(["This Friday", "Next Monday", "End of week", "In two days"]);
  };

  const decisions = (decisionLines.length ? decisionLines : lines.slice(0, 3)).slice(0, 4).map((l) => capital(l.replace(/\.$/, "")));

  const actions = (actionLines.length ? actionLines : lines.slice(0, 3)).slice(0, 5).map((l, i) => ({
    task: capital(l.replace(/\.$/, "").slice(0, 90)),
    owner: owners[i % owners.length]!,
    deadline: deadlineIn(l),
  }));

  const words = clean.toLowerCase().match(/\b[a-z]{5,}\b/g) ?? [];
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  const topics = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([w]) => capital(w));

  const summary = `${title.trim() || "The meeting"}${date ? ` (${date})` : ""} covered ${
    lines.length
  } discussion point${lines.length === 1 ? "" : "s"}${people.length ? ` with ${people.slice(0, 3).join(", ")} contributing` : ""}. ${
    decisions.length ? `The group settled on ${decisions.length} key decision${decisions.length === 1 ? "" : "s"}` : "No formal decisions were recorded"
  }, and ${actions.length} action item${actions.length === 1 ? "" : "s"} were assigned with owners and deadlines. ${
    lines[0] ? `Main thread of discussion: ${lines[0].slice(0, 120)}.` : ""
  }`;

  return {
    title: title.trim() || "Untitled meeting",
    summary,
    decisions: decisions.length ? decisions : ["No explicit decisions were captured in these notes."],
    actions,
    topics: topics.length ? topics : ["General discussion"],
  };
}

export function summaryToText(s: NotesSummary) {
  return [
    `${s.title}`,
    ``,
    `SUMMARY`,
    s.summary,
    ``,
    `KEY DECISIONS`,
    ...s.decisions.map((d) => `• ${d}`),
    ``,
    `ACTION ITEMS`,
    ...s.actions.map((a) => `• ${a.task} — ${a.owner} (due ${a.deadline})`),
    ``,
    `IMPORTANT TOPICS`,
    s.topics.join(", "),
  ].join("\n");
}

/* ------------------------------ tasks ------------------------------ */

export type PlanTask = {
  id: string;
  name: string;
  time: string;
  priority: string;
  duration: string;
  done: boolean;
};

export type TaskInput = { name: string; priority: string; schedule: string };

const rank: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

export function generatePlan(tasks: TaskInput[]): PlanTask[] {
  const sorted = [...tasks].sort((a, b) => (rank[a.priority] ?? 1) - (rank[b.priority] ?? 1));
  let minutes = 9 * 60;
  return sorted.map((t, i) => {
    const dur = t.priority === "High" ? 90 : t.priority === "Medium" ? 60 : 30;
    const start = minutes;
    minutes += dur + (i % 2 === 0 ? 15 : 10);
    const h = Math.floor(start / 60);
    const m = start % 60;
    const label = `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
    return {
      id: Math.random().toString(36).slice(2),
      name: t.name,
      time: `${label}${t.schedule === "This Week" ? " · This week" : ""}`,
      priority: t.priority,
      duration: `${dur} min`,
      done: false,
    };
  });
}

export function planToText(plan: PlanTask[]) {
  return ["TODAY'S PLAN", ...plan.map((t) => `${t.time} — ${t.name} (${t.priority}, ${t.duration})`)].join("\n");
}
