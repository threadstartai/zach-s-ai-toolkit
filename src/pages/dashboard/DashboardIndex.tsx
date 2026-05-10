import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Q2_FROM_CODE, Q3_FROM_CODE, codeQ2, codeQ3 } from "@/pages/result/shared/codes";
import { audiencePhrase, useCasePhrase } from "@/pages/result/shared/phrases";
import { splitFirstPrompt } from "@/pages/result/shared/chunks";
import { caseStudyForRole } from "@/lib/caseStudies";

type StackRow = {
  id: string;
  name: string | null;
  stack_label: string | null;
  q2_audience: string | null;
  q3_use_case: string | null;
  q3_other_text: string | null;
  q4_confidence: string | null;
  ai_picked_tools: string[] | null;
  created_at: string;
};

type FocusChunk = {
  id: string;
  title: string | null;
  content: string;
  toolName: string;
  toolSlug: string;
  prompt: string | null;
};

type RecentSave = {
  id: string;
  title: string | null;
  toolName: string | null;
  savedAt: string;
};

type SectionsState = {
  tonight: boolean;
  notes: boolean;
  stacks: boolean;
  saves: boolean;
};

const SECTIONS_KEY = "myaistack:dashboard-sections";
const DEFAULT_SECTIONS: SectionsState = { tonight: true, notes: true, stacks: true, saves: false };

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
};

const subtitleFor = (s: StackRow) => {
  const c2 = codeQ2(Q2_FROM_CODE[s.q2_audience ?? ""] ?? null);
  const useText = s.q3_use_case === "other"
    ? (s.q3_other_text || "something else")
    : useCasePhrase(codeQ3(Q3_FROM_CODE[s.q3_use_case ?? ""] ?? null), "");
  return `${audiencePhrase(c2)}, working on ${useText}`;
};

const claudeDeeplink = (prompt: string) =>
  `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

const SectionShell = ({
  label, open, onOpenChange, children,
}: {
  label: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) => (
  <Collapsible open={open} onOpenChange={onOpenChange}>
    <CollapsibleTrigger className="group flex w-full items-center justify-between text-left py-3 hover:bg-navy-light/20 rounded-[8px] -mx-2 px-2 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2">
      <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy">{label}</span>
      <ChevronDown className="h-4 w-4 text-navy/60 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
    </CollapsibleTrigger>
    <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up pt-3 pb-2">
      {children}
    </CollapsibleContent>
  </Collapsible>
);

const DashboardIndex = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stacks, setStacks] = useState<StackRow[]>([]);
  const [error, setError] = useState(false);

  const [sections, setSections] = useState<SectionsState>(DEFAULT_SECTIONS);

  const [focus, setFocus] = useState<FocusChunk | null>(null);
  const [focusLoading, setFocusLoading] = useState(true);

  const [noteContent, setNoteContent] = useState("");
  const [noteSummary, setNoteSummary] = useState<string | null>(null);
  const [noteDirty, setNoteDirty] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [summarising, setSummarising] = useState(false);
  const [summariseError, setSummariseError] = useState<string | null>(null);
  const noteHydrated = useRef(false);

  const [recentSaves, setRecentSaves] = useState<RecentSave[]>([]);

  // Hydrate sections
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SECTIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSections({ ...DEFAULT_SECTIONS, ...parsed });
      }
    } catch { /* ignore */ }
  }, []);

  const setOpen = (key: keyof SectionsState, v: boolean) => {
    setSections((prev) => {
      const next = { ...prev, [key]: v };
      try { localStorage.setItem(SECTIONS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  // Load stacks
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from("sessions")
        .select("id, name, stack_label, q2_audience, q3_use_case, q3_other_text, q4_confidence, ai_picked_tools, created_at")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (err) { setError(true); setLoading(false); return; }
      setStacks((data ?? []) as StackRow[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const mostRecent = stacks[0] ?? null;

  // Tonight focus
  useEffect(() => {
    if (!mostRecent) { setFocusLoading(false); return; }
    let cancelled = false;
    (async () => {
      setFocusLoading(true);
      const slugs = (mostRecent.ai_picked_tools ?? []).filter(Boolean);
      if (slugs.length === 0) {
        if (!cancelled) { setFocus(null); setFocusLoading(false); }
        return;
      }
      const { data: tools } = await supabase
        .from("tools")
        .select("id, name, slug")
        .in("slug", slugs);
      if (cancelled) return;
      if (!tools || tools.length === 0) { setFocus(null); setFocusLoading(false); return; }

      const toolIds = tools.map((t: any) => t.id);
      const { data: chunks } = await supabase
        .from("chunks")
        .select("id, title, content, chunk_type, priority, tool_id")
        .in("tool_id", toolIds)
        .eq("chunk_type", "first-prompt")
        .order("priority", { ascending: false })
        .limit(3);
      if (cancelled) return;
      const top = chunks?.[0];
      if (!top) { setFocus(null); setFocusLoading(false); return; }
      const tool = tools.find((t: any) => t.id === top.tool_id);
      const split = splitFirstPrompt(top.content ?? "");
      setFocus({
        id: top.id,
        title: top.title,
        content: top.content,
        toolName: tool?.name ?? "Your stack",
        toolSlug: tool?.slug ?? "",
        prompt: split.prompt,
      });
      setFocusLoading(false);
    })();
    return () => { cancelled = true; };
  }, [mostRecent?.id]);

  // Load notes
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_notes")
        .select("content, summary")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setNoteContent(data.content ?? "");
        setNoteSummary(data.summary ?? null);
      }
      noteHydrated.current = true;
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Auto-save notes (debounced 1s)
  useEffect(() => {
    if (!user || !noteHydrated.current || !noteDirty) return;
    const handle = setTimeout(async () => {
      setNoteSaving(true);
      await supabase
        .from("user_notes")
        .upsert({ user_id: user.id, content: noteContent }, { onConflict: "user_id" });
      setNoteSaving(false);
      setNoteDirty(false);
    }, 1000);
    return () => clearTimeout(handle);
  }, [noteContent, noteDirty, user]);

  // Recent saves
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("saved_chunks")
        .select("chunk_id, created_at, chunks(id, title, tools(name))")
        .order("created_at", { ascending: false })
        .limit(3);
      if (cancelled || !data) return;
      const rows: RecentSave[] = data
        .filter((r: any) => r.chunks)
        .map((r: any) => ({
          id: r.chunks.id,
          title: r.chunks.title,
          toolName: r.chunks?.tools?.name ?? null,
          savedAt: r.created_at,
        }));
      setRecentSaves(rows);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleSummarise = async () => {
    if (noteContent.trim().length < 30 || summarising) return;
    setSummariseError(null);
    setSummarising(true);
    try {
      const { data, error: err } = await supabase.functions.invoke("summarise-notes", {
        body: { content: noteContent },
      });
      if (err || !data?.summary) {
        setSummariseError(data?.error || "Couldn't summarise — try again");
      } else {
        setNoteSummary(data.summary);
      }
    } catch {
      setSummariseError("Couldn't summarise — try again");
    } finally {
      setSummarising(false);
    }
  };

  const greetingName = useMemo(() => {
    const fromStack = mostRecent?.name?.trim();
    const meta = (user?.user_metadata as { display_name?: string } | undefined)?.display_name?.trim();
    const fromStackClean = fromStack && fromStack.toLowerCase() !== "anonymous" ? fromStack : "";
    const raw = fromStackClean || meta || "";
    if (!raw) return "there";
    return raw.split(/\s+/)[0];
  }, [mostRecent, user]);

  if (error) return <Navigate to="/onboarding" replace />;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <p className="text-[14px] text-foreground/60 italic">One moment…</p>
      </div>
    );
  }

  if (stacks.length === 0) return <Navigate to="/onboarding" replace />;

  const recentId = mostRecent!.id;
  const stackHome = `/dashboard/stacks/${recentId}/my-stack`;
  const divider = "border-t border-[hsl(var(--border))]";

  return (
    <div className="max-w-[800px] mx-auto px-5 sm:px-8 py-8 md:py-10">
      {/* Greeting */}
      <header>
        <h1 className="text-[32px] font-bold text-foreground tracking-[-0.02em] leading-[1.15]">
          {greetingName === "there" ? "Hello, there." : `Hello, ${greetingName}.`}
        </h1>
        <p className="mt-2 text-[15px] text-navy/75 italic">
          Simplify and cut your AI learning curve.
        </p>
      </header>

      {/* Tonight */}
      <section className={`mt-8 ${divider} pt-2`}>
        <SectionShell label="Tonight" open={sections.tonight} onOpenChange={(v) => setOpen("tonight", v)}>
          {focusLoading ? (
            <p className="text-[14px] text-foreground/60 italic">One moment…</p>
          ) : !focus ? (
            <div>
              <p className="text-[15px] text-foreground/70 leading-[1.6]">
                No focus chunk for your most recent stack yet.
              </p>
              <Link
                to={stackHome}
                className="mt-2 inline-block text-[14px] text-navy hover:underline"
              >
                Set up your tonight focus →
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-navy">
                From {focus.toolName}
              </p>
              {focus.title && (
                <h3 className="mt-2 text-[18px] font-bold text-foreground leading-[1.3]">
                  {focus.title}
                </h3>
              )}
              {(() => {
                const split = splitFirstPrompt(focus.content ?? "");
                return (
                  <>
                    {split.before && (
                      <p className="mt-3 text-[15px] text-foreground/85 leading-[1.65] whitespace-pre-wrap">{split.before}</p>
                    )}
                    {split.prompt && (
                      <div className="my-3 bg-background border border-navy/[0.12] border-l-[3px] border-l-navy rounded-[8px] px-5 py-4">
                        <pre className="whitespace-pre-wrap font-mono text-[13.5px] leading-[1.7] text-foreground/90">{split.prompt}</pre>
                      </div>
                    )}
                    {split.after && (
                      <p className="mt-3 text-[15px] text-foreground/85 leading-[1.65] whitespace-pre-wrap">{split.after}</p>
                    )}
                  </>
                );
              })()}
              {focus.prompt && (
                <a
                  href={claudeDeeplink(focus.prompt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center justify-center bg-navy text-primary-foreground rounded-[8px] px-4 h-10 text-[14px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out"
                >
                  Try this prompt in Claude →
                </a>
              )}
              <div className="mt-4">
                <Link to={stackHome} className="text-[14px] text-navy hover:underline">
                  Skip ahead to your stack →
                </Link>
              </div>
            </div>
          )}
        </SectionShell>
      </section>

      {/* Notes */}
      <section className={`mt-6 ${divider} pt-2`}>
        <SectionShell label="Notes" open={sections.notes} onOpenChange={(v) => setOpen("notes", v)}>
          <div>
            <textarea
              value={noteContent}
              onChange={(e) => { setNoteContent(e.target.value); setNoteDirty(true); }}
              placeholder="Quick notes — what you're learning, prompts that worked, things to try…"
              className="w-full min-h-[140px] bg-background border border-[hsl(var(--border))] rounded-[12px] px-4 py-3 text-[15px] leading-[1.6] text-foreground placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 resize-y"
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-[13px] italic text-foreground/55">
                {noteSaving ? "Saving…" : noteDirty ? "Unsaved changes…" : "Saved automatically."}
              </span>
              <button
                onClick={handleSummarise}
                disabled={noteContent.trim().length < 30 || summarising}
                className="inline-flex items-center justify-center bg-navy text-primary-foreground rounded-[8px] px-4 h-9 text-[13px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {summarising ? "Summarising…" : "Summarise"}
              </button>
            </div>
            {summariseError && (
              <p className="mt-2 text-[13px] text-destructive">{summariseError}</p>
            )}
            {noteSummary && (
              <div className="mt-3 bg-navy-light/30 border border-navy-light/60 rounded-[10px] px-4 py-3">
                <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy">Summary</p>
                <p className="mt-2 italic text-[14px] text-foreground/85 leading-[1.6]">
                  {noteSummary}
                </p>
              </div>
            )}
          </div>
        </SectionShell>
      </section>

      {/* Your stacks */}
      <section className={`mt-6 ${divider} pt-2`}>
        <SectionShell label="Your stacks" open={sections.stacks} onOpenChange={(v) => setOpen("stacks", v)}>
          <p className="mb-4 text-[14px] text-foreground/70 leading-[1.55]">
            One stack per situation — research, side project, daily life.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stacks.map((s) => {
              const name = s.stack_label || `Stack from ${formatDate(s.created_at)}`;
              return (
                <Link
                  key={s.id}
                  to={`/dashboard/stacks/${s.id}/my-stack`}
                  className="block bg-card border border-[hsl(var(--border))] rounded-[12px] p-5 hover:border-navy/40 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                >
                  <h3 className="text-[16px] font-bold text-foreground">{name}</h3>
                  <p className="mt-1.5 text-[13px] text-foreground/70 leading-[1.55]">
                    {subtitleFor(s)}
                  </p>
                </Link>
              );
            })}
          </div>
          <div className="mt-4">
            <Link to="/onboarding" className="text-[14px] text-navy hover:underline">
              + Start a new stack
            </Link>
          </div>
        </SectionShell>
      </section>

      {/* Recent saves */}
      <section className={`mt-6 ${divider} pt-2`}>
        <SectionShell label="Recent saves" open={sections.saves} onOpenChange={(v) => setOpen("saves", v)}>
          {recentSaves.length === 0 ? (
            <p className="text-[14px] text-foreground/60 italic">Nothing saved yet.</p>
          ) : (
            <div>
              <ul className="space-y-3">
                {recentSaves.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/dashboard/stacks/${recentId}/saved`}
                      className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
                    >
                      {r.toolName && (
                        <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-navy">
                          From {r.toolName}
                        </p>
                      )}
                      <p className="mt-0.5 text-[15px] text-foreground group-hover:underline">
                        {r.title || "Untitled chunk"}
                      </p>
                      <p className="mt-0.5 text-[12px] text-foreground/55">
                        Saved {formatDate(r.savedAt)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link to={`/dashboard/stacks/${recentId}/saved`} className="text-[14px] text-navy hover:underline">
                  See all saves →
                </Link>
              </div>
            </div>
          )}
        </SectionShell>
      </section>

    </div>
  );
};

export default DashboardIndex;
