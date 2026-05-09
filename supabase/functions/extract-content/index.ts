import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, getClientIP, isValidUuid, sanitiseString } from "../_shared/validation.ts";

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
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const ip = getClientIP(req);

  const { data: hourly, error: e1 } = await supabase.rpc("check_rate_limit", {
    p_identifier: ip,
    p_action: "ai_extraction",
    p_max_count: 20,
    p_window_seconds: 3600,
  });
  if (e1) return json({ error: "Rate limit check failed" }, 500);
  if (!hourly) return json({ error: "Hourly rate limit exceeded" }, 429);

  const { data: daily, error: e2 } = await supabase.rpc("check_rate_limit", {
    p_identifier: ip,
    p_action: "ai_extraction_daily",
    p_max_count: 100,
    p_window_seconds: 86400,
  });
  if (e2) return json({ error: "Rate limit check failed" }, 500);
  if (!daily) return json({ error: "Daily rate limit exceeded" }, 429);

  if (!isValidUuid(body.session_id)) return json({ error: "Invalid session_id" }, 400);
  if (!isValidUuid(body.tool_id)) return json({ error: "Invalid tool_id" }, 400);
  const extractionType = sanitiseString(body.extraction_type, 50);
  if (!extractionType) return json({ error: "Invalid extraction_type" }, 400);

  return json({
    status: "scaffolded",
    message: "Real extraction logic in Phase 5",
  });
});
