import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChunkBlock } from "../shared/ChunkBlock";
import { SaveChunkButton } from "../shared/SaveChunkButton";
import { useSavedChunks } from "../shared/useSavedChunks";
import { useResultContext } from "../shared/useResultContext";
import { TOOLS } from "../shared/tools";
import type { Chunk } from "../shared/types";
import { SkeletonChunkList } from "@/components/ui-primitives/Skeletons";

type SavedRow = Chunk & { savedAt: string; toolName: string | null };

const Saved = () => {
  const { user } = useAuth();
  const { savedChunkIds, toggleSave } = useSavedChunks();
  const { picks } = useResultContext();
  const [chunks, setChunks] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<SavedRow[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data: saves } = await supabase
        .from("saved_chunks")
        .select("chunk_id, created_at, chunks(id, title, content, chunk_type, priority, tool_id, tools(name, slug))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (saves) {
        const rows: SavedRow[] = saves
          .filter((s: any) => s.chunks)
          .map((s: any) => ({
            id: s.chunks.id,
            tool_id: s.chunks.tool_id,
            chunk_type: s.chunks.chunk_type,
            title: s.chunks.title,
            content: s.chunks.content,
            priority: s.chunks.priority,
            savedAt: s.created_at,
            toolName: s.chunks?.tools?.name ?? null,
          }));
        setChunks(rows);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Filter the displayed list by current saved set so unsaving removes immediately
  const visible = chunks.filter((c) => savedChunkIds.has(c.id));

  useEffect(() => {
    if (loading || !user || picks.length === 0) return;
    const visibleNow = chunks.filter((c) => savedChunkIds.has(c.id));
    if (visibleNow.length > 0) return;

    let cancelled = false;
    setSuggestionsLoading(true);
    (async () => {
      const slugs = picks.map((k) => TOOLS[k]?.slug).filter(Boolean) as string[];
      if (slugs.length === 0) {
        setSuggestionsLoading(false);
        return;
      }

      const { data: toolRows } = await supabase
        .from("tools")
        .select("id, slug, name")
        .in("slug", slugs);
      if (cancelled || !toolRows) {
        setSuggestionsLoading(false);
        return;
      }

      const toolMap = Object.fromEntries(toolRows.map((t: any) => [t.id, t]));
      const toolIds = toolRows.map((t: any) => t.id);

      const { data: chunkRows } = await supabase
        .from("chunks")
        .select("id, title, content, chunk_type, priority, tool_id")
        .in("tool_id", toolIds)
        .in("chunk_type", ["first-prompt", "setup", "workflow-example"])
        .order("priority", { ascending: false });
      if (cancelled) return;

      const seen = new Set<string>();
      const top: SavedRow[] = [];
      for (const c of (chunkRows ?? [])) {
        const tool = toolMap[(c as any).tool_id];
        if (!tool || seen.has((c as any).tool_id)) continue;
        seen.add((c as any).tool_id);
        top.push({
          id: (c as any).id,
          tool_id: (c as any).tool_id,
          chunk_type: (c as any).chunk_type,
          title: (c as any).title,
          content: (c as any).content,
          priority: (c as any).priority,
          savedAt: "",
          toolName: (tool as any).name,
        });
      }
      setSuggestions(top);
      setSuggestionsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [loading, user, picks, chunks, savedChunkIds]);

  const handleSaveSuggestion = async (chunk: SavedRow) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== chunk.id));
    try {
      await toggleSave(chunk.id);
      setChunks((prev) => [
        { ...chunk, savedAt: new Date().toISOString() },
        ...prev.filter((c) => c.id !== chunk.id),
      ]);
    } catch {
      setSuggestions((prev) => [chunk, ...prev]);
    }
  };

  return (
    <div>
      <h3 className="text-[32px] font-bold tracking-[-0.02em]">Saved</h3>
      <p className="mt-3 italic text-[15px] text-foreground/70">
        Bits of guidance you've kept for later.
      </p>

      {loading && <SkeletonChunkList count={2} className="mt-10" />}

      {!loading && visible.length === 0 && (
        <div className="mt-10">
          <p className="text-[15px] text-foreground/85 leading-[1.65] max-w-[680px]">
            Hit the bookmark on any chunk in your stack and it'll show up here. Want to start? Three worth saving from your stack:
          </p>

          {suggestionsLoading && (
            <p className="mt-8 text-[14px] italic text-foreground/60">Pulling suggestions…</p>
          )}

          {!suggestionsLoading && suggestions.length === 0 && picks.length === 0 && (
            <p className="mt-6 text-[14px] italic text-foreground/60">
              Nothing to suggest yet — finish your stack first.
            </p>
          )}

          {!suggestionsLoading && suggestions.length > 0 && (
            <div className="mt-6 flex flex-col gap-4">
              {suggestions.map((ch) => (
                <div
                  key={ch.id}
                  className="relative bg-card border border-[hsl(var(--border))] rounded-[12px] p-6 transition-colors duration-200 ease-out hover:border-navy/40"
                >
                  <SaveChunkButton
                    saved={savedChunkIds.has(ch.id)}
                    onClick={() => handleSaveSuggestion(ch)}
                  />
                  <div className="pr-10">
                    {ch.toolName && (
                      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-navy/60 mb-2">
                        From {ch.toolName}
                      </div>
                    )}
                    <ChunkBlock chunk={ch} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="mt-10 flex flex-col gap-4">
          {visible.map((ch) => (
            <div
              key={ch.id}
              className="relative bg-card border border-[hsl(var(--border))] rounded-[12px] p-6 transition-colors duration-200 ease-out hover:border-navy/40"
            >
              <SaveChunkButton
                saved={savedChunkIds.has(ch.id)}
                onClick={() => toggleSave(ch.id)}
              />
              <div className="pr-10">
                {ch.toolName && (
                  <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-navy/60 mb-2">
                    From {ch.toolName}
                  </div>
                )}
                <ChunkBlock chunk={ch} />
                <p className="mt-4 text-[12px] italic text-foreground/55">
                  Saved {new Date(ch.savedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Saved;
