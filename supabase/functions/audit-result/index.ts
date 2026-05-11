import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, isValidUuid, sanitiseString } from "../_shared/validation.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing auth" }, 401);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ error: "Not authenticated" }, 401);

  if (!LOVABLE_API_KEY) return json({ error: "Audit unavailable" }, 503);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const sessionId = body.session_id;
  const stepId = body.step_id;
  const aiOutput = sanitiseString(body.ai_output, 5000);

  if (!isValidUuid(sessionId)) return json({ error: "Invalid session_id" }, 400);
  if (!isValidUuid(stepId)) return json({ error: "Invalid step_id" }, 400);
  if (aiOutput.length < 10) return json({ error: "Paste your AI output (10+ chars)" }, 400);

  const { data: allowed, error: rlErr } = await admin.rpc("check_rate_limit", {
    p_identifier: `user:${user.id}`,
    p_action: "audit_result",
    p_max_count: 20,
    p_window_seconds: 3600,
  });
  if (rlErr) return json({ error: "Rate limit check failed" }, 500);
  if (!allowed) return json({ error: "Rate limit exceeded" }, 429);

  const { data: step } = await supabase
    .from("learning_plan_steps")
    .select("id, plan_id, position, title, purpose, tool_slug, step_kind, learning_plans!inner(id, user_id, session_id)")
    .eq("id", stepId)
    .maybeSingle();

  if (!step) return json({ error: "Step not found" }, 404);
  const plan = (step as any).learning_plans;
  if (plan.user_id !== user.id) return json({ error: "Forbidden" }, 403);
  if (plan.session_id !== sessionId) return json({ error: "Step/session mismatch" }, 400);

  const system = `You're auditing an AI-generated output against the Master Prompt Guide and Rules With AI principles.

The user just completed a step in their learning plan: "${step.title}".
Step purpose: "${step.purpose}".

They've pasted the AI output below. Audit it on these dimensions and return a brief, direct critique:

1. Did it answer what was actually asked? Or did it drift into adjacent territory?
2. Any unsupported claims or hallucinations? Specific facts, quotes, figures, or sources that aren't backed.
3. Confidence vs evidence: anything stated with confidence that's actually uncertain or speculative?
4. What's weak? Where would you push back if this were your own draft?
5. What's missing? What would make this materially better?

Return 4–6 short bullet points. Lead with the strongest concern. Use UK English. No hype words ("revolutionary", "transform", "leverage" etc). No fake encouragement. Be direct — that's the help.

If the output looks genuinely solid, say so plainly and call out the one thing that could still be tightened. Don't manufacture problems.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  let critique = "";
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: aiOutput },
        ],
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.log("audit-result: gateway non-ok", res.status, errText);
      if (res.status === 429) return json({ error: "AI is busy. Try again shortly." }, 429);
      if (res.status === 402) return json({ error: "AI credits exhausted." }, 402);
      return json({ error: "Couldn't reach the audit. Try again." }, 502);
    }
    const payload = await res.json();
    critique = (payload?.choices?.[0]?.message?.content ?? "").trim();
    if (!critique) return json({ error: "Empty audit response. Try again." }, 502);
  } catch (e) {
    clearTimeout(timeout);
    console.log("audit-result: gateway error", e);
    return json({ error: "Couldn't reach the audit. Try again." }, 502);
  }

  try {
    await admin.from("learning_events").insert({
      plan_id: plan.id,
      step_id: stepId,
      user_id: user.id,
      event_type: "audit_completed",
      payload: { position: step.position, output_length: aiOutput.length },
    });
  } catch (e) {
    console.log("audit-result: event insert failed", e);
  }

  return json({ critique });
});
