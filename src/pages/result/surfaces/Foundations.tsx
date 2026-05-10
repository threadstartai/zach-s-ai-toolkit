import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SECTION_LABELS, groupChunks } from "../shared/chunks";
import { ChunkBlock } from "../shared/ChunkBlock";
import type { Chunk } from "../shared/types";
import { fullGuideUrl } from "@/lib/pdfs";

const FOUNDATIONAL_ORDER = [
  "start-here",
  "master-prompt-guide",
  "rules-with-ai",
  "the-process",
  "why-i-made-this",
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
  const [tools, setTools] = useState<FoundationalTool[]>([]);
  const [chunksByToolId, setChunksByToolId] = useState<Record<string, Chunk[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

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

  const ordered = FOUNDATIONAL_ORDER
    .map((slug) => tools.find((t) => t.slug === slug))
    .filter((t): t is FoundationalTool => Boolean(t));

  return (
    <div>
      <h3 className="text-3xl font-bold tracking-[-0.02em]">Foundations</h3>
      <p className="mt-3 italic text-[15px] text-foreground/70">
        The nine guides that make the rest of the Stack make sense. Start with the first three — they're the spine.
      </p>

      {loading && (
        <p className="mt-10 italic text-foreground/60">Loading the guides…</p>
      )}
      {error && !loading && (
        <p className="mt-10 italic text-foreground/60">Couldn't load the foundations. Refresh the page.</p>
      )}

      {!loading && !error && (
        <div className="mt-10 flex flex-col gap-4">
          {ordered.map((t) => {
            const isOpen = expandedSlug === t.slug;
            const tChunks = chunksByToolId[t.id] ?? [];
            const grouped = groupChunks(tChunks);
            return (
              <div
                key={t.slug}
                className="bg-background border border-[hsl(var(--border))] rounded-[12px] p-6 sm:p-8 transition-colors duration-200 ease-out hover:border-navy/30"
              >
                <button
                  type="button"
                  onClick={() => setExpandedSlug(isOpen ? null : t.slug)}
                  className="w-full text-left flex items-start gap-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                  aria-expanded={isOpen}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[22px] font-bold text-navy">{t.name}</h4>
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
                    {fullGuideUrl(t.slug) && (
                      <a href={fullGuideUrl(t.slug)!} target="_blank" rel="noopener noreferrer"
                         className="block text-[13px] italic text-navy/70 hover:text-navy underline underline-offset-2 mb-4">
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
                                    className="bg-background border border-[hsl(var(--border))] rounded-[12px] p-5 md:p-6 transition-colors duration-150 hover:border-navy/40"
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
