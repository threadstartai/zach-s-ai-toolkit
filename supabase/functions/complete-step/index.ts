import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/validation.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing auth" }, 401);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ error: "Not authenticated" }, 401);

  const body = await req.json().catch(() => null);
  if (!body) return json({ error: "Invalid body" }, 400);
  const stepId = body.step_id as string | undefined;
  const action = body.action as "done" | "skipped" | undefined;
  if (!stepId || (action !== "done" && action !== "skipped")) {
    return json({ error: "step_id and action ('done'|'skipped') required" }, 400);
  }

  // Fetch step + parent plan
  const { data: step, error: stepErr } = await supabase
    .from("learning_plan_steps")
    .select("id, plan_id, position, status, learning_plans!inner(id, user_id, current_step_id)")
    .eq("id", stepId)
    .maybeSingle();

  if (stepErr || !step) return json({ error: "Step not found" }, 404);
  // RLS already gates this, but double-check ownership for clarity.
  const plan = (step as any).learning_plans;
  if (!plan || plan.user_id !== user.id) return json({ error: "Forbidden" }, 403);

  // Fetch all steps in plan
  const { data: allSteps } = await supabase
    .from("learning_plan_steps")
    .select("id, position, status")
    .eq("plan_id", step.plan_id)
    .order("position", { ascending: true });

  const steps = allSteps ?? [];

  const findNext = () => {
    const locked = steps.find((s: any) => s.position > step.position && s.status === "locked");
    if (locked) return locked;
    const open = steps.find(
      (s: any) => s.position > step.position && (s.status === "available" || s.status === "in_progress"),
    );
    return open ?? null;
  };
  const next = findNext();

  // Idempotency
  if (step.status === "done" || step.status === "skipped") {
    return json({
      next_step_id: plan.current_step_id ?? next?.id ?? null,
      completed_position: step.position,
      total_steps: steps.length,
      is_complete: !plan.current_step_id && !next,
      idempotent: true,
    });
  }

  const newStatus = action === "done" ? "done" : "skipped";

  const { error: updErr } = await supabase
    .from("learning_plan_steps")
    .update({
      status: newStatus,
      completed_at: action === "done" ? new Date().toISOString() : null,
    })
    .eq("id", stepId);
  if (updErr) return json({ error: "Update failed" }, 500);

  if (next && next.status === "locked") {
    await supabase
      .from("learning_plan_steps")
      .update({ status: "available" })
      .eq("id", next.id)
      .eq("status", "locked");
  }

  await supabase
    .from("learning_plans")
    .update({ current_step_id: next ? next.id : null })
    .eq("id", step.plan_id);

  await supabase.from("learning_events").insert({
    plan_id: step.plan_id,
    step_id: stepId,
    user_id: user.id,
    event_type: action === "done" ? "step_completed" : "step_skipped",
    payload: { position: step.position },
  });

  return json({
    next_step_id: next?.id ?? null,
    completed_position: step.position,
    total_steps: steps.length,
    is_complete: next == null,
  });
});
