import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AuditPanelProps = {
  sessionId: string;
  stepId: string;
  compact?: boolean;
};

export const AuditPanel = ({ sessionId, stepId, compact = false }: AuditPanelProps) => {
  const [open, setOpen] = useState(false);
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [critique, setCritique] = useState<string | null>(null);

  const reset = () => {
    setOpen(false);
    setOutput("");
    setCritique(null);
    setBusy(false);
  };

  const runAudit = async () => {
    if (busy) return;
    const trimmed = output.trim();
    if (trimmed.length < 10) {
      toast.error("Paste your AI output first (10+ chars).");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("audit-result", {
        body: { session_id: sessionId, step_id: stepId, ai_output: trimmed },
      });
      if (error || !data?.critique) {
        toast.error((data as any)?.error ?? "Couldn't reach the audit — try again.");
        setBusy(false);
        return;
      }
      setCritique(data.critique);
      setBusy(false);
    } catch {
      toast.error("Couldn't reach the audit — try again.");
      setBusy(false);
    }
  };

  const titleSize = compact ? "text-[14px]" : "text-[16px]";
  const eyebrowSize = compact ? "text-[10px]" : "text-[11px]";
  const wrapperCls = compact
    ? "mt-5 pt-4 border-t border-[hsl(var(--border))]/60"
    : "mt-10 pt-6 border-t border-[hsl(var(--border))]/60 text-left max-w-[560px] mx-auto";

  if (!open) {
    return (
      <div className={wrapperCls}>
        <p className={`font-mono ${eyebrowSize} tracking-[0.12em] uppercase text-navy`}>
          Audit
        </p>
        <p className={`mt-2 ${titleSize} text-foreground/85 leading-[1.55]`}>
          Got the AI output? Paste it and I'll check it against the briefing rules.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex items-center justify-center bg-transparent border border-navy text-navy rounded-[8px] px-4 h-9 text-[13px] font-medium hover:bg-navy-light/40 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
        >
          Audit your output →
        </button>
      </div>
    );
  }

  return (
    <div className={wrapperCls}>
      <p className={`font-mono ${eyebrowSize} tracking-[0.12em] uppercase text-navy`}>
        Audit
      </p>

      {!critique && (
        <>
          <p className={`mt-2 ${titleSize} text-foreground/85 leading-[1.55]`}>
            Paste what the AI gave you. I'll check it for drift, unsupported claims, and what's weak.
          </p>
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder="Paste the AI response here…"
            disabled={busy}
            className="mt-3 w-full min-h-[140px] bg-background border border-[hsl(var(--border))] rounded-[8px] px-4 py-3 text-[14px] leading-[1.6] text-foreground placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 resize-y disabled:opacity-60"
          />
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={runAudit}
              disabled={busy || output.trim().length < 10}
              className="inline-flex items-center justify-center bg-navy text-primary-foreground rounded-[8px] px-4 h-9 text-[13px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? "Auditing…" : "Run audit"}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="text-[13px] text-foreground/60 hover:text-foreground/85 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {critique && (
        <div className="mt-3 bg-navy-light/30 border border-navy-light/60 rounded-[10px] px-4 py-4">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy">
            Audit notes
          </p>
          <div className="mt-2 text-[14px] text-foreground/85 leading-[1.65] whitespace-pre-wrap">
            {critique}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => { setCritique(null); setOutput(""); }}
              className="text-[13px] text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
            >
              Audit another
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-[13px] text-foreground/60 hover:text-foreground/85 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
