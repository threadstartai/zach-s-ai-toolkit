import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChunkBlock } from "../shared/ChunkBlock";
import { SaveChunkButton } from "../shared/SaveChunkButton";
import { useSavedChunks } from "../shared/useSavedChunks";
import type { Chunk } from "../shared/types";

type SavedRow = Chunk & { savedAt: string; toolName: string | null };

const Saved = () => {
  const { user } = useAuth();
  const { savedChunkIds, toggleSave } = useSavedChunks();
  const [chunks, setChunks] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h3 className="text-3xl font-bold tracking-[-0.02em]">Saved</h3>
      <p className="mt-3 italic text-[15px] text-foreground/70">
        Bits of guidance you've kept for later.
      </p>

      {loading && (
        <p className="mt-10 text-[14px] text-foreground/60 italic">One moment — loading your saves.</p>
      )}

      {!loading && visible.length === 0 && (
        <div className="mt-12 max-w-[480px] mx-auto text-center">
          <p className="text-[14px] italic text-foreground/65">Nothing saved yet.</p>
          <p className="mt-3 text-[15px] text-foreground/85 leading-[1.65]">
            When you find a chunk worth coming back to, save it. They'll all live here.
          </p>
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="mt-10 flex flex-col gap-4">
          {visible.map((ch) => (
            <div
              key={ch.id}
              className="relative bg-background border border-[hsl(var(--border))] rounded-[12px] p-6 transition-colors duration-150 hover:border-navy/40"
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
