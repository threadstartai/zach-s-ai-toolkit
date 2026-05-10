import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { ResultSidebar } from "@/pages/result/ResultSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type StackLite = {
  id: string;
  stack_label: string | null;
  created_at: string;
};

const DashboardShell = () => {
  const { user } = useAuth();
  const { sessionId } = useParams<{ sessionId: string }>();
  const [stacks, setStacks] = useState<StackLite[]>([]);
  const [savedCount, setSavedCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("sessions")
        .select("id, stack_label, created_at")
        .order("created_at", { ascending: false });
      if (!cancelled && data) setStacks(data as StackLite[]);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from("saved_chunks")
        .select("chunk_id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (!cancelled && typeof count === "number") setSavedCount(count);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const current =
    (sessionId && stacks.find((s) => s.id === sessionId)) ||
    stacks[0] ||
    null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardTopBar />
      <div className="flex-1 flex flex-col md:flex-row">
        <ResultSidebar
          mode="dashboard"
          currentStackId={current?.id ?? null}
          currentStackLabel={current?.stack_label ?? null}
          currentStackCreatedAt={current?.created_at ?? null}
          savedCount={savedCount}
        />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardShell;
