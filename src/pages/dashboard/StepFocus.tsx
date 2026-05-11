import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
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

const claudeDeeplink = (prompt: string) =>
  `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

const USE_CASE_LABELS: Record<string, string> = {
  writing: "writing properly",
  research: "researching a topic",
  building: "building something",
  notes: "note-taking and meetings",
  images: "images and video",
  admin: "admin and emails",
};

const ROLE_LABELS: Record<string, string> = {
  founder: "founder / CEO",
  solo: "solo / freelance",
  "team-lead": "team lead",
  ic: "individual contributor",
  student: "student",
  personal: "personal life",
  retired: "exploring / retired",
};

const personalContextLine = (p: {
  q3_use_case: string | null;
  q3_other_text: string | null;
  onboarding_role: string | null;
}): string => {
  const useText = p.q3_use_case === "other"
    ? (p.q3_other_text || "something specific")
    : (p.q3_use_case ? USE_CASE_LABELS[p.q3_use_case] ?? p.q3_use_case : "what you want help with");
  const roleText = p.onboarding_role ? ROLE_LABELS[p.onboarding_role] ?? p.onboarding_role : null;
  return roleText ? `${useText}, as a ${roleText}` : useText;
};

const StepFocus = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const cameFromOnboarding = searchParams.get("first") === "1";

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [chunk, setChunk] = useState<ChunkRow | null>(null);
  const [toolName, setToolName] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState<{
    q3_use_case: string | null;
    q3_other_text: string | null;
    onboarding_role: string | null;
  } | null>(null);
  const [showWelcome, setShowWelcome] = useState(cameFromOnboarding);

  const current = plan && steps.length > 0
    ? (steps.find((s) => s.id === plan.current_step_id) ||
       steps.find((s) => s.status === "available") ||
       steps.find((s) => s.status === "in_progress") ||
       steps.find((s) => s.status !== "done" && s.status !== "skipped") ||
       null)
    : null;

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: planRow } = await supabase
        .from("learning_plans")
        .select("id, title, current_step_id, lane, plan_version")
        .eq("session_id", sessionId)
        .maybeSingle();
      if (cancelled) return;

      if (!planRow) {
        navigate("/dashboard", { replace: true });
        return;
      }

      const { data: stepRows } = await supabase
        .from("learning_plan_steps")
        .select("id, position, status, title, purpose, instruction, primary_chunk_id, tool_slug, step_kind")
        .eq("plan_id", planRow.id)
        .order("position", { ascending: true });
      if (cancelled) return;

      const { data: sessionRow } = await supabase
        .from("sessions")
        .select("q3_use_case, q3_other_text, onboarding_role")
        .eq("id", sessionId)
        .maybeSingle();
      if (!cancelled && sessionRow) setProfile(sessionRow);

      setPlan(planRow as Plan);
      setSteps((stepRows ?? []) as Step[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [sessionId, navigate]);

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
    setShowWelcome(false);
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

  const allDone =
    !!plan &&
    steps.length > 0 &&
    !steps.some((s) => s.status === "available" || s.status === "in_progress" || s.status === "locked");

  const doneCount = steps.filter((s) => s.status === "done").length;
  const next = current
    ? steps.find((s) => s.position === current.position + 1) ?? null
    : null;
  const split = chunk?.content ? splitFirstPrompt(chunk.content) : null;
  const promptText = split?.prompt ?? null;

  const eyebrowParts = current
    ? [
        "NEXT UP",
        `STEP ${current.position} OF ${steps.length}`,
        toolName ? toolName.toUpperCase() : null,
      ].filter(Boolean) as string[]
    : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-5 sm:px-8 py-5 flex items-center justify-between border-b border-[hsl(var(--border))]/60">
        <Link to="/dashboard" className="font-bold text-navy tracking-tight text-[15px]">
          My AI Stack
        </Link>
        <Link
          to="/dashboard"
          className="text-[13px] text-foreground/60 hover:text-foreground/85 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
        >
          ← Back to dashboard
        </Link>
      </header>

      <main className="flex-1 max-w-[720px] mx-auto w-full px-5 sm:px-8 py-12 md:py-16">
        {loading && <SkeletonHeroCard />}

        {!loading && allDone && (
          <div className="text-center">
            <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-navy">
              Plan complete
            </p>
            <h1 className="mt-4 text-[36px] sm:text-[44px] font-bold text-foreground tracking-[-0.025em] leading-[1.1]">
              {doneCount === steps.length
                ? "You've worked through every step."
                : `You've worked through ${doneCount} of ${steps.length} steps.`}
            </h1>
            <p className="mt-5 text-[17px] text-foreground/80 leading-[1.65] max-w-[560px] mx-auto">
              That's the starting plan done. The tools are yours to keep using — come back to your stack any time you want to dig deeper or start a new one.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
              <Link
                to={`/dashboard/stacks/${sessionId}/my-stack`}
                className="inline-flex items-center justify-center bg-navy text-primary-foreground rounded-[8px] px-5 h-11 text-[15px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
              >
                Open your stack →
              </Link>
              <Link
                to="/dashboard"
                className="text-[14px] text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        )}

        {!loading && !allDone && current && (
          <>
            {showWelcome && current.position === 1 && (
              <div className="mb-8 pb-6 border-b border-[hsl(var(--border))]/60">
                <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-navy">
                  Welcome
                </p>
                <p className="mt-3 text-[18px] text-foreground/90 leading-[1.55] font-medium">
                  This is your first step. The button below sends a prompt straight to Claude — that's the whole game.
                </p>
                {profile && (
                  <p className="mt-3 text-[13px] text-foreground/55 italic leading-[1.6]">
                    Picked from your answers: {personalContextLine(profile)}.
                  </p>
                )}
              </div>
            )}
            <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-navy">
              {eyebrowParts.join(" · ")}
            </p>
            <h1 className="mt-4 text-[36px] sm:text-[44px] font-bold text-foreground tracking-[-0.025em] leading-[1.1]">
              {current.title}
            </h1>
            {current.purpose && (
              <p className="mt-5 text-[17px] text-foreground/80 leading-[1.65]">
                {current.purpose}
              </p>
            )}
            {current.instruction && (
              <p className="mt-4 text-[17px] text-foreground/80 leading-[1.65]">
                {current.instruction}
              </p>
            )}

            {promptText && (
              <>
                <div className="my-6 bg-card border border-navy/[0.12] border-l-[3px] border-l-navy rounded-[8px] px-6 py-5">
                  <pre className="whitespace-pre-wrap font-mono text-[14px] leading-[1.7] text-foreground/90">{promptText}</pre>
                </div>
                <a
                  href={claudeDeeplink(promptText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-transparent border border-navy text-navy rounded-[8px] px-5 h-10 text-[14px] font-medium hover:bg-navy-light/40 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                >
                  Try this prompt in Claude →
                </a>
              </>
            )}

            <div className="mt-10 pt-6 border-t border-[hsl(var(--border))]/60 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => complete("done")}
                disabled={busy}
                className="inline-flex items-center justify-center bg-navy text-primary-foreground rounded-[8px] px-5 h-11 text-[15px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
                  {saved ? "Saved" : "Save for later"}
                </button>
              )}
              <button
                type="button"
                onClick={() => complete("skipped")}
                disabled={busy}
                className="text-[14px] text-foreground/60 hover:text-foreground/85 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Skip this step
              </button>
            </div>

            {next && (
              <p className="mt-8 text-[14px] text-foreground/55">
                Next · Step {next.position}: {next.title}
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default StepFocus;
