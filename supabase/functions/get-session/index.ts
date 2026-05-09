import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, getClientIP, isValidUuid } from "../_shared/validation.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let sessionId: string | null = null;
  if (req.method === "GET") {
    sessionId = new URL(req.url).searchParams.get("session_id");
  } else if (req.method === "POST") {
    try {
      const body = await req.json();
      sessionId = typeof body?.session_id === "string" ? body.session_id : null;
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
  } else {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!sessionId || !isValidUuid(sessionId)) {
    return json({ error: "Invalid session id" }, 400);
  }

  const ip = getClientIP(req);
  const { data: allowed, error: rlErr } = await supabase.rpc("check_rate_limit", {
    p_identifier: ip,
    p_action: "session_read",
    p_max_count: 30,
    p_window_seconds: 3600,
  });
  if (rlErr) return json({ error: "Rate limit check failed" }, 500);
  if (!allowed) return json({ error: "Rate limit exceeded" }, 429);

  const { data, error } = await supabase
    .from("sessions")
    .select("name, q2_audience, q3_use_case, q3_other_text, q4_confidence, q5_learning_style, created_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (error) return json({ error: "Lookup failed" }, 500);
  if (!data) return json({ error: "Not found" }, 404);

  return json({ session: data });
});
