import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SECTION_LABELS, groupChunks } from "../shared/chunks";
import { ChunkBlock } from "../shared/ChunkBlock";
import type { Chunk } from "../shared/types";
import { fullGuideUrl } from "@/lib/pdfs";
import { SkeletonGuideCard } from "@/components/ui-primitives/Skeletons";
import { EmptyState } from "@/components/ui-primitives/EmptyState";
import { ProcessDiagram } from "@/components/diagrams/ProcessDiagram";

const FOUNDATION_ORDER = [
  "start-here",
  "why-i-made-this",
  "the-process",
  "how-this-was-built",
  "building-things-overview",
  "power-ups",
  "pass-this-on",
];

type FoundationalTool = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
};

const Foundations = () => {
  const { user } = useAuth();
  const [tools, setTools] = useState<FoundationalTool[]>([]);
  const [chunksByToolId, setChunksByToolId] = useState<Record<string, Chunk[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [readSlugs, setReadSlugs] = useState<Set<string>>(new Set());
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [userToggled, setUserToggled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: toolRows, error: toolErr } = await supabase
          .from("tools")
          .select("id, slug, name, tagline")
          .eq("category", "foundational");
        if (toolErr) throw toolErr;
        const toolIds = (toolRows ?? []).map((t) => t.id);
        let chunkRows: Chunk[] = [];
        if (toolIds.length) {
          const { data: cRows, error: cErr } = await supabase
            .from("chunks")
            .select("id, tool_id, title, content, chunk_type, priority")
            .in("tool_id", toolIds)
            .order("priority", { ascending: false })
            .order("title", { ascending: true });
          if (cErr) throw cErr;
          chunkRows = (cRows ?? []) as Chunk[];
        }
        if (cancelled) return;
        const grouped: Record<string, Chunk[]> = {};
        for (const c of chunkRows) {
          (grouped[c.tool_id] ||= []).push(c);
        }
        setTools((toolRows ?? []) as FoundationalTool[]);
        setChunksByToolId(grouped);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("foundation_progress")
        .select("foundation_slug")
        .eq("user_id", user.id);
      if (!cancelled && data) {
        setReadSlugs(new Set(data.map((r: { foundation_slug: string }) => r.foundation_slug)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const ordered = useMemo(
    () =>
      FOUNDATION_ORDER.map((slug) => tools.find((t) => t.slug === slug)).filter(
        (t): t is FoundationalTool => Boolean(t),
      ),
    [tools],
  );

  const nextUnreadSlug = useMemo(() => {
    for (const f of ordered) {
      if (!readSlugs.has(f.slug)) return f.slug;
    }
    return null;
  }, [ordered, readSlugs]);

  const totalCount = ordered.length;
  const readCount = ordered.filter((f) => readSlugs.has(f.slug)).length;

  // Auto-expand next unread until user manually toggles
  useEffect(() => {
    if (!userToggled && nextUnreadSlug) setOpenSlug(nextUnreadSlug);
  }, [nextUnreadSlug, userToggled]);

  const markRead = async (slug: string) => {
    if (!user) return;
    const prev = readSlugs;
    const next = new Set(prev);
    next.add(slug);
    setReadSlugs(next);
    setUserToggled(false); // allow auto-advance to next unread
    setOpenSlug(null);
    const { error: insErr } = await supabase
      .from("foundation_progress")
      .insert({ user_id: user.id, foundation_slug: slug });
    if (insErr && insErr.code !== "23505") {
      setReadSlugs(prev);
      toast.error("Couldn't mark as read — try again");
    }
  };

  const markUnread = async (slug: string) => {
    if (!user) return;
    const prev = readSlugs;
    const next = new Set(prev);
    next.delete(slug);
    setReadSlugs(next);
    const { error: delErr } = await supabase
      .from("foundation_progress")
      .delete()
      .eq("user_id", user.id)
      .eq("foundation_slug", slug);
    if (delErr) {
      setReadSlugs(prev);
      toast.error("Couldn't update — try again");
    }
  };

  const handleToggle = (slug: string) => {
    setUserToggled(true);
    setOpenSlug((cur) => (cur === slug ? null : slug));
  };

  return (
    <div>
      <header className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-navy">
          Foundations · {readCount} of {totalCount} read
        </p>
        <h1 className="mt-3 text-[32px] sm:text-[36px] font-bold text-foreground tracking-[-0.02em] leading-[1.15]">
          The thinking under the tools.
        </h1>
        <p className="mt-3 text-[15px] text-foreground/75 leading-[1.65] max-w-[640px]">
          {totalCount > 0 && readCount === totalCount
            ? "You've worked through every foundational. The tools above sit on top of these — come back when you want to refresh."
            : "Work through these in order. Each one builds on the last. The tools on your stack will make more sense once you've read these."}
        </p>
        <div className="mt-4 h-1 w-full rounded-full bg-navy-light overflow-hidden">
          <div
            className="h-full bg-navy rounded-full transition-all duration-300 ease-out"
            style={{ width: `${totalCount === 0 ? 0 : (readCount / totalCount) * 100}%` }}
          />
        </div>
      </header>

      {loading && (
        <div className="mt-10 flex flex-col gap-4">
          {Array.from({ length: 7 }).map((_, i) => <SkeletonGuideCard key={i} />)}
        </div>
      )}
      {error && !loading && (
        <EmptyState>Couldn't load the foundations. Refresh the page.</EmptyState>
      )}

      {!loading && !error && (
        <div className="mt-6 flex flex-col gap-4">
          {ordered.map((t, i) => {
            const isOpen = openSlug === t.slug;
            const isRead = readSlugs.has(t.slug);
            const tChunks = chunksByToolId[t.id] ?? [];
            const grouped = groupChunks(tChunks);
            return (
              <div
                key={t.slug}
                className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-5 sm:p-6 transition-colors duration-200 ease-out hover:border-navy/30"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(t.slug)}
                  className="w-full text-left flex items-start gap-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                  aria-expanded={isOpen}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy/60">
                      {i + 1} of {totalCount}
                    </p>
                    <h4 className="mt-1.5 text-[20px] font-bold text-navy flex flex-wrap items-center gap-2">
                      <span>{t.name}</span>
                      {isRead && (
                        <span className="inline-flex items-center bg-navy-light/40 text-navy text-[11px] font-mono uppercase tracking-[0.1em] rounded-[4px] px-1.5 py-0.5">
                          ✓ Read
                        </span>
                      )}
                    </h4>
                    {t.tagline && (
                      <p className="mt-2 text-[15px] text-foreground/80 leading-[1.6]">{t.tagline}</p>
                    )}
                  </div>
                  <svg
                    className={`shrink-0 mt-2 h-4 w-4 text-navy/60 transition-transform duration-200 ease-out ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="4 6 8 10 12 6" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="mt-6 pt-6 border-t border-foreground/10">
                    {t.slug === "the-process" && (
                      <div className="mb-8">
                        <ProcessDiagram />
                      </div>
                    )}
                    {fullGuideUrl(t.slug) && (
                      <a href={fullGuideUrl(t.slug)!} target="_blank" rel="noopener noreferrer"
                         className="block text-[13px] italic text-navy/70 hover:text-navy underline underline-offset-2 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm">
                        Download the full guide (.docx) ↓
                      </a>
                    )}
                    {tChunks.length === 0 ? (
                      <p className="italic text-foreground/60">Coming soon.</p>
                    ) : (
                      <div className="flex flex-col gap-5">
                        {SECTION_LABELS.map((s) => {
                          const items = grouped[s.key];
                          if (!items || items.length === 0) return null;
                          return (
                            <div key={s.key}>
                              <div className="mt-1 mb-3">
                                <div className="font-mono text-[11px] tracking-[0.08em] text-navy">
                                  {s.label}
                                </div>
                                <div className="mt-1.5 h-px w-12 bg-navy/30" />
                              </div>
                              <div className="flex flex-col gap-3">
                                {items.map((ch) => (
                                  <div
                                    key={ch.id}
                                    className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-5 md:p-6 transition-colors duration-200 ease-out hover:border-navy/40"
                                  >
                                    <ChunkBlock chunk={ch} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {user && (
                      <div className="mt-6 pt-5 border-t border-[hsl(var(--border))]/60 flex items-center justify-between gap-4">
                        <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy/60">
                          {i + 1} of {totalCount}
                        </span>
                        {isRead ? (
                          <button
                            type="button"
                            onClick={() => markUnread(t.slug)}
                            className="text-[13px] text-foreground/60 hover:text-foreground/85 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
                          >
                            ✓ Read · Mark unread
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => markRead(t.slug)}
                            className="inline-flex items-center justify-center bg-navy text-primary-foreground rounded-[8px] px-4 h-9 text-[13px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Foundations;
