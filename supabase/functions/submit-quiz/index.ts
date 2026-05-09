import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  corsHeaders,
  getClientIP,
  isValidAudience,
  isValidConfidence,
  isValidLearningStyle,
  isValidUseCase,
  sanitiseString,
} from "../_shared/validation.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function userIdFromAuthHeader(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  if (!token) return null;
  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
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

  const { data: allowed, error: rlErr } = await admin.rpc("check_rate_limit", {
    p_identifier: ip,
    p_action: "quiz_submit",
    p_max_count: 10,
    p_window_seconds: 3600,
  });
  if (rlErr) return json({ error: "Rate limit check failed" }, 500);
  if (!allowed) return json({ error: "Rate limit exceeded" }, 429);

  const name = sanitiseString(body.name, 50);
  if (name.length < 1) return json({ error: "Invalid name" }, 400);

  const q2 = body.q2_audience;
  const q3 = body.q3_use_case;
  const q3Other = sanitiseString(body.q3_other_text ?? "", 200);
  const q4 = body.q4_confidence;
  const q5 = body.q5_learning_style;

  if (!isValidAudience(q2)) return json({ error: "Invalid audience" }, 400);
  if (!isValidUseCase(q3)) return json({ error: "Invalid use case" }, 400);
  if (!isValidConfidence(q4)) return json({ error: "Invalid confidence" }, 400);
  if (q5 !== null && q5 !== undefined && !isValidLearningStyle(q5)) {
    return json({ error: "Invalid learning style" }, 400);
  }

  // Derive user_id from JWT only — never trust client-supplied user_id.
  const userId = await userIdFromAuthHeader(req);

  const { data, error } = await admin
    .from("sessions")
    .insert({
      name,
      q2_audience: q2,
      q3_use_case: q3,
      q3_other_text: q3 === "other" ? q3Other : null,
      q4_confidence: q4,
      q5_learning_style: q5 ?? null,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error) return json({ error: "Failed to save session" }, 500);
  return json({ session_id: data.id });
});
