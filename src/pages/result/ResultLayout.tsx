import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { ResultSidebar } from "./ResultSidebar";
import { AskDrawer } from "./AskDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedChunks } from "./shared/useSavedChunks";
import { TOOLS, recommend } from "./shared/tools";
import {
  Q2_FROM_CODE, Q3_FROM_CODE, Q4_FROM_CODE,
  codeQ2, codeQ3, codeQ4, isMeaningfulName, UUID_RE,
} from "./shared/codes";
import { SECTION_LABELS } from "./shared/chunks";
import type { Chunk, LoadedSession, ToolKey, ToolStatus } from "./shared/types";
import type { ResultContext } from "./shared/useResultContext";
import { SkeletonHeroCard, SkeletonChunkList } from "@/components/ui-primitives/Skeletons";

const ResultLayout = ({ chrome = "public" }: { chrome?: "public" | "dashboard" } = {}) => {
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [askOpen, setAskOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [session, setSession] = useState<LoadedSession | null>(null);

  // Load the session from the URL.
  useEffect(() => {
    if (!routeSessionId || !UUID_RE.test(routeSessionId)) {
      setError(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("get-session", {
          body: { session_id: routeSessionId },
        });
        if (cancelled) return;
        if (fnError || !data?.session) {
          setError(true);
        } else {
          setSession(data.session as LoadedSession);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [routeSessionId]);

  // Poll for AI picks if session is recent and AI hasn't completed yet
  useEffect(() => {
    if (!session || !routeSessionId) return;
    const aiTools = (session as any).ai_picked_tools;
    if (Array.isArray(aiTools) && aiTools.length === 3) return;

    const createdAt = (session as any).created_at as string | undefined;
    if (!createdAt) return;
    const ageMs = Date.now() - new Date(createdAt).getTime();
    if (ageMs > 30000) return;

    let attempts = 0;
    const maxAttempts = 8;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const { data } = await supabase.functions.invoke("get-session", {
          body: { session_id: routeSessionId },
        });
        const updated = (data as any)?.session;
        if (updated?.ai_picked_tools && Array.isArray(updated.ai_picked_tools) && updated.ai_picked_tools.length === 3) {
          setSession(updated);
          clearInterval(interval);
          return;
        }
      } catch {
        // ignore, keep polling
      }
      if (attempts >= maxAttempts) clearInterval(interval);
    }, 1500);

    return () => clearInterval(interval);
  }, [session, routeSessionId]);

  // Derive raw question strings (Result-component shape).
  const name = session?.name ?? "";
  const q2 = session ? (Q2_FROM_CODE[session.q2_audience ?? ""] ?? null) : null;
  const q3 = session
    ? (session.q3_use_case === "other"
        ? (session.q3_other_text ?? "Other")
        : (Q3_FROM_CODE[session.q3_use_case ?? ""] ?? null))
    : null;
  const q4 = session ? (Q4_FROM_CODE[session.q4_confidence ?? ""] ?? null) : null;
  const q3OtherText = session?.q3_use_case === "other" ? (session.q3_other_text ?? "") : "";

  const c2 = codeQ2(q2);
  const c3 = codeQ3(q3);
  const c4 = codeQ4(q4);

  const displayName = isMeaningfulName(name) ? name.trim() : null;
  const title = displayName ? `${displayName}'s AI Stack` : "My AI Stack";

  const aiSlugs = session?.ai_picked_tools ?? null;
  const aiPickReasoning = session?.ai_pick_reasoning ?? null;

  const slugToKey = useMemo(() => {
    const map = new Map<string, ToolKey>();
    for (const [key, tool] of Object.entries(TOOLS)) {
      map.set(tool.slug, key as ToolKey);
    }
    return map;
  }, []);

  const picks = useMemo(() => {
    if (Array.isArray(aiSlugs) && aiSlugs.length === 3) {
      const keys = aiSlugs
        .map((s) => slugToKey.get(s))
        .filter((k): k is NonNullable<typeof k> => Boolean(k));
      if (keys.length === 3) return keys;
    }
    return recommend(c2, c3, c4);
  }, [aiSlugs, c2, c3, c4, slugToKey]);
  const pickSlugs = useMemo(() => picks.map((k) => TOOLS[k].slug), [picks]);

  // Chunks + status state.
  const [chunksByTool, setChunksByTool] = useState<Record<string, Chunk[]>>({});
  const [statusByTool, setStatusByTool] = useState<Record<string, ToolStatus>>({});
  const [showSlowMessage, setShowSlowMessage] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState<Record<string, boolean>>({});
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { savedChunkIds, toggleSave } = useSavedChunks();

  useEffect(() => {
    if (!session || pickSlugs.length === 0) return;
    let cancelled = false;
    const slowTimer = setTimeout(() => { if (!cancelled) setShowSlowMessage(true); }, 300);

    (async () => {
      const { data: tools } = await supabase
        .from("tools")
        .select("id, slug, status, update_message")
        .in("slug", pickSlugs);

      if (!tools || cancelled) return;
      const slugToId = new Map(tools.map((t) => [t.slug, t.id]));
      const slugToStatus = new Map(
        tools.map((t) => [t.slug, { status: t.status, update_message: t.update_message }])
      );

      const result: Record<string, Chunk[]> = {};
      await Promise.all(
        pickSlugs.map(async (slug) => {
          const toolId = slugToId.get(slug);
          if (!toolId) { result[slug] = []; return; }
          const { data: rows } = await supabase
            .from("chunks")
            .select("id, tool_id, chunk_type, title, content, priority, tags_audience, tags_use_case, tags_confidence")
            .eq("tool_id", toolId);

          const filtered = (rows ?? []).filter((r: any) => {
            const a: string[] = r.tags_audience ?? [];
            const u: string[] = r.tags_use_case ?? [];
            const co: string[] = r.tags_confidence ?? [];
            const audOk = a.length === 0 || a.includes(c2) || a.includes("all");
            const useOk = c3 === "other" || u.length === 0 || u.includes(c3) || u.includes("all");
            const confOk = co.length === 0 || co.includes(c4) || co.includes("all");
            return audOk && useOk && confOk;
          });
          filtered.sort((a: any, b: any) => (b.priority ?? 0) - (a.priority ?? 0));

          const grouped: Record<string, Chunk[]> = { why: [], tonight: [], worth: [] };
          for (const ch of filtered as Chunk[]) {
            for (const s of SECTION_LABELS) {
              if (s.types.includes(ch.chunk_type)) { grouped[s.key].push(ch); break; }
            }
          }
          const picked: Chunk[] = [];
          for (const s of SECTION_LABELS) {
            const top = grouped[s.key][0];
            if (top) picked.push(top);
          }
          result[slug] = picked;
        }),
      );
      if (!cancelled) {
        setChunksByTool(result);
        const statusResult: Record<string, ToolStatus> = {};
        for (const slug of pickSlugs) {
          const s = slugToStatus.get(slug);
          if (s) statusResult[slug] = s;
        }
        setStatusByTool(statusResult);
        setShowSlowMessage(false);
      }
    })();

    return () => { cancelled = true; clearTimeout(slowTimer); };
  }, [session, pickSlugs.join("|"), c2, c3, c4]);

  const handleStartOver = () => {
    navigate("/stack");
    setTimeout(() => {
      document.getElementById("build-my-stack")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleCopyShareLink = async () => {
    if (!routeSessionId || typeof window === "undefined") return;
    const url = `${window.location.origin}/stack/result/${routeSessionId}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const submitFeedback = async (toolSlug: string, reason: string) => {
    try {
      await supabase.from("chunk_feedback").insert({
        session_id: routeSessionId ?? null,
        tool_slug: toolSlug,
        reason,
      });
    } catch {
      // non-fatal
    }
    setFeedbackOpen((prev) => ({ ...prev, [toolSlug]: false }));
    setFeedbackSubmitted((prev) => ({ ...prev, [toolSlug]: true }));
  };

  const ctx: ResultContext = {
    sessionId: routeSessionId ?? "",
    name,
    q2, q3, q4,
    c2, c3, c4,
    q3OtherText,
    displayName,
    title,
    picks,
    pickSlugs,
    chunksByTool,
    statusByTool,
    showSlowMessage,
    feedbackOpen,
    feedbackSubmitted,
    saved,
    setSaved,
    linkCopied,
    handleStartOver,
    handleCopyShareLink,
    setFeedbackOpen,
    submitFeedback,
    savedChunkIds,
    toggleSave,
    aiPickReasoning,
    isDashboard: chrome === "dashboard",
    stackLabel: session?.stack_label ?? null,
    onboardingRole: (session as any)?.onboarding_role ?? null,
    onboardingTimeBudget: (session as any)?.onboarding_time_budget ?? null,
    onboardingExistingTools: (session as any)?.onboarding_existing_tools ?? null,
    toolStatusMap: Object.fromEntries(
      Object.entries(statusByTool).map(([slug, s]) => [
        slug,
        { status: s?.status ?? "current", updateMessage: s?.update_message ?? null },
      ])
    ),
  };

  const isDashboard = chrome === "dashboard";

  const dashboardSkeleton = (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-card border border-[hsl(var(--border))] rounded-[16px] p-8 mt-6 first:mt-0">
          <div className="h-6 bg-navy-light/40 rounded-full w-1/3 animate-pulse" />
          <div className="mt-3 h-4 bg-navy-light/30 rounded-full w-2/3 animate-pulse" />
          <div className="mt-6 h-3 bg-navy-light/30 rounded-full w-full animate-pulse" />
          <div className="mt-2 h-3 bg-navy-light/30 rounded-full w-5/6 animate-pulse" />
          <div className="mt-2 h-3 bg-navy-light/30 rounded-full w-4/6 animate-pulse" />
        </div>
      ))}
    </>
  );

  const body = (
    <>
      {loading && (
        chrome === "dashboard" ? dashboardSkeleton : (
          <div className="flex flex-col gap-6">
            <SkeletonHeroCard />
            <SkeletonChunkList count={2} />
            <SkeletonChunkList count={2} />
          </div>
        )
      )}
      {!loading && error && (
        <div>
          <h2 className="text-[28px] font-bold text-navy">This Stack isn't here.</h2>
          <p className="mt-3 text-navy/85 text-[17px] leading-[1.7]">
            Either the link's expired or the URL got mangled in transit.{" "}
            <Link to="/stack" className="text-navy underline underline-offset-2 hover:opacity-80">
              Build your own Stack →
            </Link>
          </p>
        </div>
      )}
      {!loading && !error && session && <Outlet context={ctx} />}
    </>
  );

  if (isDashboard) {
    return (
      <>
        <div className="max-w-[820px] mx-auto px-5 sm:px-8 md:px-12 py-8 md:py-10">
          {body}
        </div>
        {user && (
          <>
            <button
              onClick={() => setAskOpen(true)}
              aria-label="Ask AI"
              style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
              className="fixed right-6 z-30 bg-navy text-primary-foreground rounded-full px-5 py-3 text-[14px] font-medium shadow-[0_4px_24px_rgba(26,58,92,0.16)] hover:bg-navy/90 transition-colors duration-150"
            >
              Ask AI
            </button>
            <AskDrawer
              open={askOpen}
              onOpenChange={setAskOpen}
              sessionId={routeSessionId ?? ""}
            />
          </>
        )}
      </>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1100px] px-6 pt-10 pb-24">
        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          <aside className="md:w-[220px] md:shrink-0">
            <div className="md:sticky md:top-24">
              <ResultSidebar
                mode="public"
                currentStackId={routeSessionId ?? null}
                currentStackLabel={session?.stack_label ?? null}
                currentStackCreatedAt={(session as any)?.created_at ?? null}
              />
            </div>
          </aside>
          <main className="flex-1 min-w-0 max-w-[760px]">{body}</main>
        </div>
      </div>
    </SiteLayout>
  );
};

export default ResultLayout;
