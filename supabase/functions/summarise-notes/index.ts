import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/validation.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

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

const SYSTEM_PROMPT = `You are summarising a user's quick notes from My AI Stack — a personal AI tool guide. Return a 1–2 sentence summary in UK English. Be tight and factual. Don't add hype, don't add advice, don't invent intent the user didn't write. If the notes look like a to-do list, summarise as priorities. If they look like questions, summarise as topics to explore. No banned words (revolutionary, game-changing, transform, etc).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const userId = await userIdFromAuthHeader(req);
  if (!userId) return json({ error: "Unauthorised" }, 401);

  if (!LOVABLE_API_KEY) return json({ error: "AI summarise unavailable" }, 503);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (content.length < 30 || content.length > 5000) {
    return json({ error: "Content must be 30–5000 characters" }, 400);
  }

  const { data: allowed, error: rlErr } = await admin.rpc("check_rate_limit", {
    p_identifier: `user:${userId}`,
    p_action: "summarise_notes",
    p_max_count: 10,
    p_window_seconds: 3600,
  });
  if (rlErr) return json({ error: "Rate limit check failed" }, 500);
  if (!allowed) return json({ error: "Rate limit exceeded" }, 429);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let summary = "";
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content },
        ],
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.log("summarise-notes: gateway non-ok", res.status, errText);
      if (res.status === 429) return json({ error: "AI is busy. Try again shortly." }, 429);
      if (res.status === 402) return json({ error: "AI credits exhausted." }, 402);
      return json({ error: "Couldn't summarise — try again" }, 502);
    }
    const payload = await res.json();
    summary = (payload?.choices?.[0]?.message?.content ?? "").trim();
    if (!summary) return json({ error: "Couldn't summarise — try again" }, 502);
  } catch (e) {
    clearTimeout(timeout);
    console.log("summarise-notes: gateway error", e);
    return json({ error: "Couldn't summarise — try again" }, 502);
  }

  const now = new Date().toISOString();
  // Upsert pattern: if the row doesn't exist yet (user clicked Summarise before
  // the 1s autosave debounce fired), insert with empty content. Otherwise update
  // only the summary fields — content is managed by the frontend autosave and
  // writing it here would race against the user's typing.
  const { data: existing, error: lookupErr } = await admin
    .from("user_notes")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (lookupErr) {
    console.error("summarise-notes: lookup failed", lookupErr);
    return json({ error: "Failed to save summary" }, 500);
  }

  if (existing) {
    const { error: updErr } = await admin
      .from("user_notes")
      .update({ summary, summary_updated_at: now })
      .eq("user_id", userId);
    if (updErr) {
      console.error("summarise-notes: update failed", updErr);
      return json({ error: "Failed to save summary" }, 500);
    }
  } else {
    const { error: insErr } = await admin
      .from("user_notes")
      .insert({ user_id: userId, content: "", summary, summary_updated_at: now });
    if (insErr) {
      console.error("summarise-notes: insert failed", insErr);
      return json({ error: "Failed to save summary" }, 500);
    }
  }

  return json({ summary });
});
