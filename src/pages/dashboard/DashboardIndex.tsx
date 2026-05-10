import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DashboardIndex = () => {
  const { user } = useAuth();
  const [target, setTarget] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from("sessions")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (err) { setError(true); return; }
      if (!data) { setTarget("/onboarding"); return; }
      setTarget(`/dashboard/stacks/${data.id}/my-stack`);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (error) return <Navigate to="/onboarding" replace />;
  if (!target) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-[14px] text-foreground/60 italic">One moment…</p>
      </div>
    );
  }
  return <Navigate to={target} replace />;
};

export default DashboardIndex;
