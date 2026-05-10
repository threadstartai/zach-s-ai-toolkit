import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type FeedbackReason = "audience-wrong" | "use-case-wrong" | "pace-wrong" | "already-using";

const OPTIONS: { code: FeedbackReason; label: string }[] = [
  { code: "audience-wrong", label: "Wrong audience for me" },
  { code: "use-case-wrong", label: "Wrong use case for me" },
  { code: "pace-wrong", label: "Wrong pace — too slow / too fast" },
  { code: "already-using", label: "Already using this" },
];

export const ChunkFeedbackButton = ({
  chunkId,
  toolSlug,
  sessionId,
}: {
  chunkId: string;
  toolSlug: string;
  sessionId?: string | null;
}) => {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (reason: FeedbackReason) => {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      await supabase.from("chunk_feedback").insert({
        chunk_id: chunkId,
        tool_slug: toolSlug,
        session_id: sessionId ?? null,
        reason,
      } as never);
      setSubmitted(true);
      setTimeout(() => setOpen(false), 1500);
    } catch {
      // best-effort
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <p className="text-[12px] italic text-foreground/55">Thanks — I'll factor that in.</p>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="text-[12px] text-foreground/55 hover:text-navy underline underline-offset-2 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
        >
          Not for me?
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        onClick={(e) => e.stopPropagation()}
        className="w-[260px] p-3 bg-popover border border-[hsl(var(--border))] rounded-[10px]"
      >
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy/70 mb-2">
          Why?
        </p>
        <div className="flex flex-col gap-1">
          {OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => submit(opt.code)}
              disabled={submitting}
              className="text-left text-[13px] text-foreground hover:bg-navy-light/30 rounded-[6px] px-2 py-1.5 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
