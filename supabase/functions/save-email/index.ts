import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  corsHeaders,
  getClientIP,
  isValidEmail,
  isValidUuid,
  sanitiseString,
} from "../_shared/validation.ts";

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

  const { data: allowed, error: rlErr } = await supabase.rpc("check_rate_limit", {
    p_identifier: ip,
    p_action: "email_save",
    p_max_count: 3,
    p_window_seconds: 3600,
  });
  if (rlErr) return json({ error: "Rate limit check failed" }, 500);
  if (!allowed) return json({ error: "Rate limit exceeded" }, 429);

  const emailRaw = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(emailRaw)) return json({ error: "Invalid email" }, 400);

  const name = sanitiseString(body.name, 50);
  if (name.length < 1) return json({ error: "Invalid name" }, 400);

  const sessionId = body.session_id;
  if (!isValidUuid(sessionId)) return json({ error: "Invalid session_id" }, 400);

  const { data: existing } = await supabase
    .from("email_captures")
    .select("id")
    .eq("email", emailRaw)
    .maybeSingle();

  if (existing) return json({ status: "already_subscribed" });

  const { error } = await supabase.from("email_captures").insert({
    email: emailRaw,
    name,
    session_id: sessionId,
    subscribed: true,
  });

  if (error) return json({ error: "Failed to save email" }, 500);
  return json({ status: "subscribed" });
});
