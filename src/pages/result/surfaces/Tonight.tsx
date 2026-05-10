import { useResultContext } from "../shared/useResultContext";
import { useAuth } from "@/contexts/AuthContext";
import { TOOLS } from "../shared/tools";
import { ChunkBlock } from "../shared/ChunkBlock";
import { SaveChunkButton } from "../shared/SaveChunkButton";
import { ChunkFeedbackButton } from "../shared/ChunkFeedbackButton";
import type { Chunk, ToolKey } from "../shared/types";

const PREFERRED_TYPES = ["first-prompt", "setup", "workflow-example"];

const Tonight = () => {
  const { picks, chunksByTool, savedChunkIds, toggleSave, sessionId } = useResultContext();
  const { user } = useAuth();

  let best: { chunk: Chunk; toolKey: ToolKey } | null = null;
  for (const type of PREFERRED_TYPES) {
    for (const k of picks) {
      const t = TOOLS[k];
      const chunks = chunksByTool[t.slug] ?? [];
      const match = chunks
        .filter((c) => c.chunk_type === type)
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0];
      if (match) {
        best = { chunk: match, toolKey: k };
        break;
      }
    }
    if (best) break;
  }

  return (
    <div>
      <h3 className="text-3xl font-bold tracking-[-0.02em]">Tonight</h3>
      <p className="mt-3 italic text-[15px] text-foreground/70">
        One thing. Do it before bed and you'll thank yourself tomorrow.
      </p>

      {best ? (
        <>
          <div className="relative mt-10 bg-card border border-[hsl(var(--border))] rounded-[12px] p-8 md:p-10 shadow-[0_2px_12px_rgba(26,58,92,0.04)]">
            {user && (
              <SaveChunkButton
                saved={savedChunkIds.has(best.chunk.id)}
                onClick={() => toggleSave(best.chunk.id)}
              />
            )}
            <div className={user ? "pr-10" : undefined}>
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-navy/60">
                From {TOOLS[best.toolKey].name}
              </div>
              {best.chunk.title && (
                <h4 className="mt-2 text-xl font-bold text-navy">{best.chunk.title}</h4>
              )}
              <div className="mt-4">
                <ChunkBlock chunk={best.chunk} />
              </div>
              <div className="mt-6 flex justify-end">
                <ChunkFeedbackButton chunkId={best.chunk.id} toolSlug={TOOLS[best.toolKey].slug} sessionId={sessionId} />
              </div>
            </div>
          </div>
          <p className="mt-10 italic text-[14px] text-foreground/65">
            When you've done it, come back. Your full stack is in My Stack.
          </p>
        </>
      ) : (
        <div className="mt-10 bg-card border border-[hsl(var(--border))] rounded-[12px] p-8 md:p-10">
          <p className="text-[15px] text-foreground/80 italic">
            Your stack doesn't have a tonight chunk yet. Head to My Stack for the full guide.
          </p>
        </div>
      )}
    </div>
  );
};

export default Tonight;
