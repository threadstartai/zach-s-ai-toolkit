import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  corsHeaders,
  getClientIP,
  isValidAudience,
  isValidConfidence,
  isValidExistingTools,
  isValidLearningStyle,
  isValidRole,
  isValidTimeBudget,
  isValidUseCase,
  sanitiseString,
} from "../_shared/validation.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

const Q2_LABELS: Record<string, string> = {
  student: "a student",
  personal: "using AI in personal life",
  business: "using AI for business or work",
  exploring: "exploring AI",
};
const Q3_LABELS: Record<string, string> = {
  writing: "writing",
  research: "research",
  building: "building things",
  notes: "note-taking and meetings",
  images: "images and video",
  admin: "admin and emails",
};
const Q4_LABELS: Record<string, string> = {
  never: "has never used AI",
  tried: "has tried AI a bit",
  weekly: "uses AI regularly",
  confident: "is confident with AI",
};
const ROLE_LABELS: Record<string, string> = {
  "founder": "a founder or CEO",
  "solo": "solo / freelance",
  "team-lead": "a team lead or manager",
  "ic": "an individual contributor",
  "student": "a student",
  "personal": "using AI in personal life",
  "retired": "retired or exploring",
};
const TIME_LABELS: Record<string, string> = {
  "15min": "about 15 minutes a week",
  "30min": "about 30 minutes a week",
  "1hr": "about 1 hour a week",
  "several": "several hours a week",
  "open": "open-ended time budget",
};

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

type AiPick = { tools: string[]; reasoning: Record<string, string> };

async function pickToolsWithAi(profile: {
  name: string;
  q2: string;
  q3: string;
  q3Other: string;
  q4: string;
  role: string | null;
  timeBudget: string | null;
  existingTools: string[] | null;
}): Promise<AiPick | null> {
  if (!LOVABLE_API_KEY) {
    console.log("ai-pick: LOVABLE_API_KEY missing, skipping");
    return null;
  }

  const { data: tools, error: toolsErr } = await admin
    .from("tools")
    .select("slug, name, tagline, category, status")
    .neq("category", "foundational")
    .neq("status", "deprecated");

  if (toolsErr || !tools || tools.length === 0) {
    console.log("ai-pick: tool catalogue fetch failed", toolsErr);
    return null;
  }

  const validSlugs = new Set(tools.map((t: any) => t.slug));
  const catalogue = tools
    .map((t: any) => `${t.slug} | ${t.name} | ${t.tagline ?? ""} | ${t.category}`)
    .join("\n");

  const useCase = profile.q3 === "other"
    ? `free text — "${profile.q3Other}"`
    : `${profile.q3} (${Q3_LABELS[profile.q3] ?? profile.q3})`;

  const system = `You're recommending the 3 best AI tools for a user of MY AI STACK. The user just answered an onboarding flow. Pick from the catalogue ONLY — exact slugs.

User profile:
- Audience: ${profile.q2} (${Q2_LABELS[profile.q2] ?? profile.q2})
- Role/situation: ${profile.role ? (ROLE_LABELS[profile.role] ?? profile.role) : "not specified"}
- Use case: ${useCase}
- Already using: ${profile.existingTools && profile.existingTools.length ? profile.existingTools.join(", ") : "nothing yet"}
- AI confidence: ${profile.q4} (${Q4_LABELS[profile.q4] ?? profile.q4})
- Time budget: ${profile.timeBudget ? (TIME_LABELS[profile.timeBudget] ?? profile.timeBudget) : "not specified"}
- Name: ${profile.name || "anonymous"}

Tool catalogue:
${catalogue}

Output strict JSON only, no prose:
{
  "tools": ["slug1", "slug2", "slug3"],
  "reasoning": {
    "slug1": "One-sentence reason this fits this specific user's situation. Reference their actual use case where possible.",
    "slug2": "...",
    "slug3": "..."
  }
}

Rules:
- Exactly 3 slugs, all from the catalogue.
- Order them by which the user should try first (priority order).
- For users with low AI confidence ('never' or 'tried'), favour Claude (slug 'claude') as one of the 3.
- For free-text use cases, pick tools that genuinely fit what they wrote. Don't force-fit.
- Each reasoning sentence should reference the user's specific situation, not generic claims.
- Use UK English. No hype words.
- The Master Prompt Guide is the foundational teaching piece. When users have low confidence ('never' or 'tried'), make sure at least one of the 3 picks is a tool that pairs naturally with the briefing skill (Claude is the strongest match — it rewards good prompts most directly). For confident users, prefer tool combinations that show the relay habit (e.g. Claude + ChatGPT, or Claude + Perplexity).
- Time-budget signal: if time budget is "15min" or "30min", AVOID tools needing deep setup (avoid Manus, Lovable, Base44 unless clearly the best fit). Prefer fast-payoff tools (Claude, ChatGPT, Wispr Flow, Granola).
- Existing-tool deprioritisation: if a tool slug appears in the user's existing-tools list, only recommend it if it's clearly the best fit AND the reasoning explicitly explains the upgrade angle ("you're already using X — here's how to push it further"). Otherwise prefer a different tool.
- Role bias: founders / solo lean toward Claude + Lovable + ChatGPT. Team leads lean toward Granola + Claude + Manus. Individual contributors lean toward Wispr Flow + Claude + Notion-equivalents. Students lean toward NotebookLM + Perplexity + Gemini.
- Each reasoning sentence should reference the user's role and time budget where it naturally fits — don't force it.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

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
          { role: "user", content: "Pick 3 tools for this user. Output JSON only." },
        ],
        response_format: { type: "json_object" },
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.log("ai-pick: gateway non-ok", res.status, await res.text());
      return null;
    }
    const payload = await res.json();
    const content: string = payload?.choices?.[0]?.message?.content ?? "";
    if (!content) return null;

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (!m) return null;
      parsed = JSON.parse(m[0]);
    }

    const tools = parsed?.tools;
    const reasoning = parsed?.reasoning;
    if (!Array.isArray(tools) || tools.length !== 3) return null;
    if (!tools.every((s) => typeof s === "string" && validSlugs.has(s))) return null;
    if (new Set(tools).size !== 3) return null;
    if (!reasoning || typeof reasoning !== "object") return null;
    for (const s of tools) {
      if (typeof reasoning[s] !== "string" || reasoning[s].trim().length === 0) return null;
    }
    return { tools, reasoning };
  } catch (e) {
    clearTimeout(timeout);
    console.log("ai-pick: error", e);
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
  const role = body.onboarding_role;
  const timeBudget = body.onboarding_time_budget;
  const existingTools = body.onboarding_existing_tools;

  if (!isValidAudience(q2)) return json({ error: "Invalid audience" }, 400);
  if (!isValidUseCase(q3)) return json({ error: "Invalid use case" }, 400);
  if (!isValidConfidence(q4)) return json({ error: "Invalid confidence" }, 400);
  if (q5 !== null && q5 !== undefined && !isValidLearningStyle(q5)) {
    return json({ error: "Invalid learning style" }, 400);
  }
  if (role !== null && role !== undefined && !isValidRole(role)) {
    return json({ error: "Invalid role" }, 400);
  }
  if (timeBudget !== null && timeBudget !== undefined && !isValidTimeBudget(timeBudget)) {
    return json({ error: "Invalid time budget" }, 400);
  }
  if (existingTools !== null && existingTools !== undefined && !isValidExistingTools(existingTools)) {
    return json({ error: "Invalid existing tools" }, 400);
  }

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
      onboarding_role: (role as string | null) ?? null,
      onboarding_time_budget: (timeBudget as string | null) ?? null,
      onboarding_existing_tools: (existingTools as string[] | null) ?? null,
    })
    .select("id")
    .single();

  if (error) return json({ error: "Failed to save session" }, 500);

  // AI tool selection — runs in background, frontend polls for the result.
  const sessionIdForAi = data.id;
  // @ts-expect-error EdgeRuntime is a Supabase Edge Functions global
  EdgeRuntime.waitUntil((async () => {
    try {
      const pick = await pickToolsWithAi({
        name,
        q2: q2 as string,
        q3: q3 as string,
        q3Other,
        q4: q4 as string,
        role: (role as string | null) ?? null,
        timeBudget: (timeBudget as string | null) ?? null,
        existingTools: (existingTools as string[] | null) ?? null,
      });
      if (pick) {
        const { error: updErr } = await admin
          .from("sessions")
          .update({
            ai_picked_tools: pick.tools,
            ai_picked_at: new Date().toISOString(),
            ai_pick_reasoning: pick.reasoning,
          })
          .eq("id", sessionIdForAi);
        if (updErr) console.log("ai-pick: update failed", updErr);
      }

      // Chain into plan creation unconditionally. The plan function handles the no-picks case
      // with deterministic defaults so a brand-new user never gets stuck without a plan.
      try {
        const planRes = await fetch(`${SUPABASE_URL}/functions/v1/create-learning-plan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${SERVICE_ROLE}`,
          },
          body: JSON.stringify({ session_id: sessionIdForAi }),
        });
        if (!planRes.ok) {
          console.log("create-learning-plan: chained call failed", planRes.status, await planRes.text());
        }
      } catch (e) {
        console.log("create-learning-plan: chained call error", e);
      }
    } catch (e) {
      console.log("ai-pick: unexpected error", e);
    }
  })());

  return json({ session_id: data.id });
});
