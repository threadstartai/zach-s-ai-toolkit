import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonHeroCard } from "@/components/ui-primitives/Skeletons";
import { splitFirstPrompt } from "@/pages/result/shared/chunks";

type Step = {
  id: string;
  position: number;
  status: string;
  title: string;
  purpose: string;
  instruction: string;
  primary_chunk_id: string | null;
  tool_slug: string | null;
  step_kind: string;
};

type Plan = {
  id: string;
  title: string;
  current_step_id: string | null;
  lane: string;
  plan_version: number;
};

type ChunkRow = { id: string; content: string; title: string | null };

type FallbackFocus = {
  id: string;
  title: string | null;
  content: string;
  toolName: string;
  prompt: string | null;
  before: string;
  after: string;
};

const claudeDeeplink = (prompt: string) =>
  `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

export const NextUpCard = ({ sessionId }: { sessionId: string }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [chunk, setChunk] = useState<ChunkRow | null>(null);
  const [toolName, setToolName] = useState<string | null>(null);
  const [fallback, setFallback] = useState<FallbackFocus | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [justCompleted, setJustCompleted] = useState<{
    position: number;
    title: string;
    purpose: string;
    isComplete: boolean;
  } | null>(null);

  const current = plan && steps.length > 0
    ? (steps.find((s) => s.id === plan.current_step_id) ||
       steps.find((s) => s.status === "available") ||
       steps.find((s) => s.status === "in_progress") ||
       steps[0])
    : null;

  // Initial fetch: plan + steps (or fallback)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setPlan(null);
      setSteps([]);
      setChunk(null);
      setToolName(null);
      setFallback(null);
      setSaved(false);

      const { data: planRow } = await supabase
        .from("learning_plans")
        .select("id, title, current_step_id, lane, plan_version")
        .eq("session_id", sessionId)
        .maybeSingle();
      if (cancelled) return;

      if (planRow) {
        const { data: stepRows } = await supabase
          .from("learning_plan_steps")
          .select("id, position, status, title, purpose, instruction, primary_chunk_id, tool_slug, step_kind")
          .eq("plan_id", planRow.id)
          .order("position", { ascending: true });
        if (cancelled) return;
        setPlan(planRow as Plan);
        setSteps((stepRows ?? []) as Step[]);
        setLoading(false);
        return;
      }

      // Fallback: legacy session — pull first-prompt chunk from ai_picked_tools
      const { data: session } = await supabase
        .from("sessions")
        .select("ai_picked_tools")
        .eq("id", sessionId)
        .maybeSingle();
      if (cancelled) return;

      const slugs = (session?.ai_picked_tools ?? []).filter(Boolean);
      if (slugs.length === 0) { setLoading(false); return; }

      const { data: tools } = await supabase
        .from("tools")
        .select("id, name, slug")
        .in("slug", slugs);
      if (cancelled || !tools || tools.length === 0) { setLoading(false); return; }

      const toolIds = tools.map((t: any) => t.id);
      const { data: chunks } = await supabase
        .from("chunks")
        .select("id, title, content, tool_id")
        .in("tool_id", toolIds)
        .eq("chunk_type", "first-prompt")
        .order("priority", { ascending: false })
        .limit(1);
      if (cancelled) return;

      const top = chunks?.[0];
      if (!top) { setLoading(false); return; }
      const tool = tools.find((t: any) => t.id === top.tool_id);
      const split = splitFirstPrompt(top.content ?? "");
      setFallback({
        id: top.id,
        title: top.title,
        content: top.content,
        toolName: tool?.name ?? "Your stack",
        prompt: split.prompt,
        before: split.before ?? "",
        after: split.after ?? "",
      });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [sessionId]);

  // Re-fetch chunk + tool + saved state whenever current step changes
  useEffect(() => {
    if (!current) return;
    let cancelled = false;
    setChunk(null);
    setToolName(null);
    setSaved(false);
    (async () => {
      if (current.primary_chunk_id) {
        const { data: c } = await supabase
          .from("chunks")
          .select("id, content, title")
          .eq("id", current.primary_chunk_id)
          .maybeSingle();
        if (!cancelled && c) setChunk(c as ChunkRow);
      }
      if (current.tool_slug) {
        const { data: t } = await supabase
          .from("tools")
          .select("name, slug")
          .eq("slug", current.tool_slug)
          .maybeSingle();
        if (!cancelled && t) setToolName(t.name);
      }
      if (user && current.primary_chunk_id) {
        const { data: existing } = await supabase
          .from("saved_chunks")
          .select("id")
          .eq("user_id", user.id)
          .eq("chunk_id", current.primary_chunk_id)
          .maybeSingle();
        if (!cancelled) setSaved(!!existing);
      }
    })();
    return () => { cancelled = true; };
  }, [current?.id, user?.id]);

  const cardCls =
    "bg-card border border-[hsl(var(--border))] rounded-[12px] p-6 md:p-8";

  const handleSave = async (chunkId: string) => {
    if (!user || saved) return;
    setSaved(true);
    const { error } = await supabase
      .from("saved_chunks")
      .insert({ user_id: user.id, chunk_id: chunkId });
    if (error) {
      setSaved(false);
      toast.error("Couldn't save — try again");
    } else {
      toast.success("Saved");
    }
  };

  const complete = async (action: "done" | "skipped") => {
    if (busy || !current) return;
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("complete-step", {
        body: { step_id: current.id, action },
      });
      if (error || !data) {
        toast.error("Couldn't update — try again");
        setBusy(false);
        return;
      }
      const completedId = current.id;
      const completedPosition = current.position;
      setSteps((prev) =>
        prev.map((s) => {
          if (s.id === completedId) {
            return { ...s, status: action === "done" ? "done" : "skipped" };
          }
          if (data.next_step_id && s.id === data.next_step_id && s.status === "locked") {
            return { ...s, status: "available" };
          }
          return s;
        }),
      );
      setPlan((prev) => (prev ? { ...prev, current_step_id: data.next_step_id } : prev));
      toast.success(
        action === "done"
          ? `Step ${completedPosition} done`
          : `Step ${completedPosition} skipped`,
      );
      setBusy(false);
    } catch {
      toast.error("Couldn't update — try again");
      setBusy(false);
    }
  };

  if (loading) return <SkeletonHeroCard />;

  // End-of-plan celebration
  const allDone =
    plan &&
    steps.length > 0 &&
    !steps.some((s) => s.status === "available" || s.status === "in_progress" || s.status === "locked");

  if (allDone) {
    const doneCount = steps.filter((s) => s.status === "done").length;
    return (
      <div className={cardCls}>
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy">
          Plan complete
        </p>
        <h2 className="mt-3 text-[28px] sm:text-[32px] font-bold text-foreground tracking-[-0.02em] leading-[1.15]">
          {doneCount === steps.length
            ? "You've worked through every step."
            : `You've worked through ${doneCount} of ${steps.length} steps.`}
        </h2>
        <p className="mt-3 text-[15px] text-foreground/85 leading-[1.65]">
          That's the starting plan done. The tools are yours to keep using — come back to your stack any time you want to dig deeper or start a new one.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <Link
            to={`/dashboard/stacks/${sessionId}/my-stack`}
            className="inline-flex items-center justify-center bg-navy text-primary-foreground rounded-[8px] px-4 h-10 text-[14px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
          >
            Open your stack →
          </Link>
          <Link
            to="/onboarding"
            className="text-[14px] text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
          >
            Start a new stack
          </Link>
        </div>
      </div>
    );
  }

  // Happy path: plan exists with an active step
  if (plan && current) {
    const next = steps.find((s) => s.position === current.position + 1) ?? null;
    const split = chunk?.content ? splitFirstPrompt(chunk.content) : null;
    const promptText = split?.prompt ?? null;

    const eyebrowParts = [
      "NEXT UP",
      `STEP ${current.position} OF ${steps.length}`,
      toolName ? toolName.toUpperCase() : null,
    ].filter(Boolean);

    return (
      <div className={cardCls}>
        <div className="flex items-start justify-between gap-4 mb-1">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy">
            {eyebrowParts.join(" · ")}
          </p>
          <Link
            to={`/dashboard/stacks/${sessionId}/step`}
            className="shrink-0 text-[12px] text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
          >
            Open in focus →
          </Link>
        </div>
        <h2 className="mt-3 text-[28px] sm:text-[32px] font-bold text-foreground tracking-[-0.02em] leading-[1.15]">
          {current.title}
        </h2>
        {current.purpose && (
          <p className="mt-3 text-[15px] text-foreground/85 leading-[1.65]">
            {current.purpose}
          </p>
        )}
        {current.instruction && (
          <p className="mt-3 text-[15px] text-foreground/85 leading-[1.65]">
            {current.instruction}
          </p>
        )}

        {promptText && (
          <>
            <div className="my-4 bg-background border border-navy/[0.12] border-l-[3px] border-l-navy rounded-[8px] px-5 py-4">
              <pre className="whitespace-pre-wrap font-mono text-[13.5px] leading-[1.7] text-foreground/90">{promptText}</pre>
            </div>
            <a
              href={claudeDeeplink(promptText)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-transparent border border-navy text-navy rounded-[8px] px-4 h-9 text-[13px] font-medium hover:bg-navy-light/40 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
            >
              Try this prompt in Claude →
            </a>
          </>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => complete("done")}
            disabled={busy}
            className="inline-flex items-center justify-center bg-navy text-primary-foreground rounded-[8px] px-4 h-10 text-[14px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Mark done
          </button>
          {current.primary_chunk_id && user && (
            <button
              type="button"
              onClick={() => handleSave(current.primary_chunk_id!)}
              disabled={saved}
              className="text-[14px] text-navy hover:underline disabled:opacity-60 disabled:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
            >
              {saved ? "Saved" : "Save"}
            </button>
          )}
          <button
            type="button"
            onClick={() => complete("skipped")}
            disabled={busy}
            className="text-[14px] text-foreground/60 hover:text-foreground/85 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Skip
          </button>
        </div>

        {next && (
          <div className="mt-5 pt-4 border-t border-[hsl(var(--border))]/60">
            <p className="text-[13px] text-foreground/55">
              After this · Step {next.position}: {next.title}
            </p>
          </div>
        )}
      </div>
    );
  }


  // Fallback: legacy first-prompt focus
  if (fallback) {
    return (
      <div className={cardCls}>
        <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy">
          TONIGHT'S FOCUS · FROM {fallback.toolName.toUpperCase()}
        </p>
        {fallback.title && (
          <h2 className="mt-3 text-[28px] sm:text-[32px] font-bold text-foreground tracking-[-0.02em] leading-[1.15]">
            {fallback.title}
          </h2>
        )}
        {fallback.before && (
          <p className="mt-3 text-[15px] text-foreground/85 leading-[1.65] whitespace-pre-wrap">
            {fallback.before}
          </p>
        )}
        {fallback.prompt && (
          <div className="my-4 bg-background border border-navy/[0.12] border-l-[3px] border-l-navy rounded-[8px] px-5 py-4">
            <pre className="whitespace-pre-wrap font-mono text-[13.5px] leading-[1.7] text-foreground/90">{fallback.prompt}</pre>
          </div>
        )}
        {fallback.after && (
          <p className="mt-3 text-[15px] text-foreground/85 leading-[1.65] whitespace-pre-wrap">
            {fallback.after}
          </p>
        )}
        {fallback.prompt && (
          <a
            href={claudeDeeplink(fallback.prompt)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center bg-navy text-primary-foreground rounded-[8px] px-4 h-10 text-[14px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
          >
            Try this prompt in Claude →
          </a>
        )}
      </div>
    );
  }

  // No plan and no focus
  return (
    <div className={cardCls}>
      <p className="text-[15px] text-foreground/70 leading-[1.6]">
        No focus chunk for your most recent stack yet.
      </p>
      <Link
        to={`/dashboard/stacks/${sessionId}/my-stack`}
        className="mt-2 inline-block text-[14px] text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
      >
        Set up your tonight focus →
      </Link>
    </div>
  );
};

export default NextUpCard;
