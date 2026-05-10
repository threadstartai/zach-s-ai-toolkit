import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Q2_FROM_CODE, Q3_FROM_CODE, codeQ2, codeQ3 } from "@/pages/result/shared/codes";
import { audiencePhrase, useCasePhrase } from "@/pages/result/shared/phrases";

type StackRow = {
  id: string;
  stack_label: string | null;
  q2_audience: string | null;
  q3_use_case: string | null;
  q3_other_text: string | null;
  q4_confidence: string | null;
  ai_picked_tools: string[] | null;
  created_at: string;
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
};

const subtitleFor = (s: StackRow) => {
  const c2 = codeQ2(Q2_FROM_CODE[s.q2_audience ?? ""] ?? null);
  const useText = s.q3_use_case === "other"
    ? (s.q3_other_text || "something else")
    : useCasePhrase(codeQ3(Q3_FROM_CODE[s.q3_use_case ?? ""] ?? null), "");
  return `${audiencePhrase(c2)}, working on ${useText}`;
};

const DashboardIndex = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stacks, setStacks] = useState<StackRow[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from("sessions")
        .select("id, stack_label, q2_audience, q3_use_case, q3_other_text, q4_confidence, ai_picked_tools, created_at, updated_at")
        .order("updated_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (err) { setError(true); setLoading(false); return; }
      setStacks((data ?? []) as StackRow[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (error) return <Navigate to="/onboarding" replace />;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <p className="text-[14px] text-foreground/60 italic">One moment…</p>
      </div>
    );
  }

  if (stacks.length === 0) return <Navigate to="/onboarding" replace />;

  return (
    <div className="max-w-[900px] mx-auto px-5 sm:px-8 py-10 md:py-12">
      <h1 className="text-[32px] font-bold text-navy">My stacks</h1>
      <p className="mt-3 italic text-navy/75 text-[15px] leading-[1.6]">
        Each stack is a quiz answer set. You can have one for research, one for a side project, one for daily life.
      </p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {stacks.map((s) => {
          const name = s.stack_label || `Stack from ${formatDate(s.created_at)}`;
          return (
            <Link
              key={s.id}
              to={`/dashboard/stacks/${s.id}/my-stack`}
              className="block bg-background border border-[hsl(var(--border))] rounded-[16px] p-6 hover:border-navy/40 transition-colors duration-150"
            >
              <h2 className="text-[18px] font-bold text-navy">{name}</h2>
              <p className="mt-2 text-[14px] text-navy/70 leading-[1.55]">
                {subtitleFor(s)}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10">
        <Link
          to="/onboarding"
          className="inline-flex items-center justify-center bg-navy text-primary-foreground rounded-[8px] px-5 h-11 text-[14px] font-medium hover:bg-navy/90 transition-colors duration-150"
        >
          + Take another quiz
        </Link>
      </div>
    </div>
  );
};

export default DashboardIndex;
