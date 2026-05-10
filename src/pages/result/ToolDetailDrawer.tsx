import { useEffect, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { ChunkBlock } from "./shared/ChunkBlock";
import { SECTION_LABELS, groupChunks } from "./shared/chunks";
import { fullGuideUrl } from "@/lib/pdfs";
import type { Chunk } from "./shared/types";
import { ChunkFeedbackButton } from "./shared/ChunkFeedbackButton";
import { SkeletonChunkList } from "@/components/ui-primitives/Skeletons";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolSlug: string | null;
};

type ToolRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  source_doc: string | null;
  status: string;
  update_message: string | null;
  when_not_to_use: string | null;
};

export const ToolDetailDrawer = ({ open, onOpenChange, toolSlug }: Props) => {
  const [tool, setTool] = useState<ToolRow | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !toolSlug) return;
    let cancelled = false;
    setLoading(true);
    setTool(null);
    setChunks([]);
    (async () => {
      const { data: t } = await supabase
        .from("tools")
        .select("id, slug, name, tagline, source_doc, status, update_message, when_not_to_use")
        .eq("slug", toolSlug)
        .maybeSingle();
      if (cancelled || !t) {
        if (!cancelled) setLoading(false);
        return;
      }
      const { data: ch } = await supabase
        .from("chunks")
        .select("id, title, content, chunk_type, priority, tool_id")
        .eq("tool_id", t.id)
        .order("priority", { ascending: false });
      if (cancelled) return;
      setTool(t as ToolRow);
      setChunks((ch ?? []) as Chunk[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, toolSlug]);

  const grouped = groupChunks(chunks);
  const pdf = tool ? fullGuideUrl(tool.slug) : null;

  const openInClaude = () => {
    if (!tool) return;
    const prompt = `Hi Claude. I'm reading the My AI Stack guide for ${tool.name}. Help me understand it and use it well — ask me clarifying questions first, push back if I'm being lazy.`;
    window.open(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[640px] overflow-y-auto p-0">
        <div className="px-6 sm:px-8 py-8">
          {loading && (
            <p className="italic text-navy/65 text-[14px]">Loading the full guide…</p>
          )}
          {tool && (
            <>
              <h2 className="text-[24px] font-bold text-navy tracking-[-0.01em]">{tool.name}</h2>
              {tool.tagline && (
                <p className="mt-2 text-[14px] italic text-navy/70 leading-[1.55]">{tool.tagline}</p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                {pdf && (
                  <a
                    href={pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-navy underline underline-offset-2 hover:opacity-80"
                  >
                    Download doc ↓
                  </a>
                )}
                <button
                  onClick={openInClaude}
                  className="text-navy underline underline-offset-2 hover:opacity-80"
                >
                  Discuss this tool in Claude →
                </button>
              </div>

              {tool.status === "update" && tool.update_message && (
                <div className="mt-5 bg-navy text-primary-foreground rounded-[8px] px-4 py-3 text-[14px] leading-[1.55]">
                  <span className="font-semibold">Update:</span> {tool.update_message}
                </div>
              )}

              {tool.when_not_to_use && (
                <div className="mt-5 bg-navy-light/60 border-l-[3px] border-l-navy rounded-[8px] px-4 py-3">
                  <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy">
                    When not to use
                  </p>
                  <p className="mt-1.5 text-[14px] leading-[1.55] text-foreground/85">
                    {tool.when_not_to_use}
                  </p>
                </div>
              )}

              <div className="mt-7 flex flex-col gap-6">
                {SECTION_LABELS.map((s) => {
                  const items = grouped[s.key];
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={s.key}>
                      <div className="mb-3">
                        <div className="font-mono text-[11px] tracking-[0.08em] text-navy">
                          {s.label}
                        </div>
                        <div className="mt-1.5 h-px w-12 bg-navy/30" />
                      </div>
                      <div className="flex flex-col gap-3">
                        {items.map((ch) => (
                          <div
                            key={ch.id}
                            className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-5 md:p-6 transition-colors duration-150 hover:border-navy/40"
                          >
                            <ChunkBlock chunk={ch} />
                            <div className="mt-3 flex justify-end">
                              <ChunkFeedbackButton chunkId={ch.id} toolSlug={tool.slug} sessionId={null} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {!loading && chunks.length === 0 && (
                  <p className="italic text-navy/65 text-[14px]">No chunks yet for this tool.</p>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
