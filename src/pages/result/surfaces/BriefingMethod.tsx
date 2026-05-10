import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SECTION_LABELS, groupChunks } from "../shared/chunks";
import { ChunkBlock } from "../shared/ChunkBlock";
import { ChunkFeedbackButton } from "../shared/ChunkFeedbackButton";
import { fullGuideUrl } from "@/lib/pdfs";
import type { Chunk } from "../shared/types";
import { SkeletonChunkList } from "@/components/ui-primitives/Skeletons";
import { EmptyState } from "@/components/ui-primitives/EmptyState";

const SLUG = "master-prompt-guide";
const PAGE_TITLE = "Briefing method";
const PAGE_SUBTITLE = "The way I talk to AI so it gives me what I actually need.";

const BriefingMethod = () => {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [tool, setTool] = useState<{ id: string; slug: string; name: string; tagline: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: t } = await supabase
        .from("tools")
        .select("id, slug, name, tagline")
        .eq("slug", SLUG)
        .maybeSingle();
      if (cancelled || !t) { if (!cancelled) setLoading(false); return; }
      const { data: ch } = await supabase
        .from("chunks")
        .select("id, title, content, chunk_type, priority, tool_id")
        .eq("tool_id", t.id)
        .order("priority", { ascending: false });
      if (cancelled) return;
      setTool(t);
      setChunks((ch ?? []) as Chunk[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const grouped = groupChunks(chunks);
  const pdf = tool ? fullGuideUrl(tool.slug) : null;

  return (
    <div>
      <h3 className="text-[32px] font-bold tracking-[-0.02em]">{PAGE_TITLE}</h3>
      <p className="mt-3 italic text-[15px] text-foreground/70 max-w-[640px]">
        {PAGE_SUBTITLE}
      </p>

      {pdf && (
        <a
          href={pdf}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-[13px] italic text-navy/70 hover:text-navy underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
        >
          Download the full guide (.docx) ↓
        </a>
      )}

      {loading && <SkeletonChunkList count={5} className="mt-10" />}

      {!loading && chunks.length === 0 && (
        <EmptyState>Coming soon.</EmptyState>
      )}

      {!loading && chunks.length > 0 && (
        <div className="mt-10 flex flex-col gap-8">
          {SECTION_LABELS.map((s) => {
            const items = grouped[s.key];
            if (!items || items.length === 0) return null;
            return (
              <div key={s.key}>
                <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy mb-3">
                  {s.label}
                </div>
                <div className="flex flex-col gap-4">
                  {items.map((ch) => (
                    <div
                      key={ch.id}
                      className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-5 md:p-6 transition-colors duration-200 ease-out hover:border-navy/40"
                    >
                      <ChunkBlock chunk={ch} />
                      <div className="mt-3 flex justify-end">
                        <ChunkFeedbackButton
                          chunkId={ch.id}
                          toolSlug={tool?.slug ?? SLUG}
                          sessionId={null}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BriefingMethod;
