import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, isValidUuid } from "../_shared/validation.ts";

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

const TOOL_NAME_MAP: Record<string, string> = {
  claude: "Claude",
  "claude-code": "Claude Code",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  perplexity: "Perplexity",
  notebooklm: "NotebookLM",
  granola: "Granola",
  "wispr-flow": "Wispr Flow",
  lovable: "Lovable",
  manus: "Manus",
  base44: "Base44",
  cursor: "Cursor",
  copilot: "Copilot",
  midjourney: "Midjourney",
  "nano-banana": "Nano Banana",
  veo: "Veo",
  suno: "Suno",
};

function toolName(slug: string): string {
  return TOOL_NAME_MAP[slug] ?? slug.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join(" ");
}

type Step = {
  position: number;
  step_kind: string;
  foundation_slug: string | null;
  tool_slug: string | null;
  title: string;
  purpose: string;
  instruction: string;
};

function buildStarting(primary: string, second: string): Step[] {
  const p = toolName(primary);
  const s = toolName(second);
  return [
    { position: 1, step_kind: "rules", foundation_slug: "rules-with-ai", tool_slug: null,
      title: "Understand what AI can and cannot do",
      purpose: "Get the honest framing before you build a habit.",
      instruction: "Open Check before trust and read the three traps." },
    { position: 2, step_kind: "briefing", foundation_slug: "master-prompt-guide", tool_slug: null,
      title: "Learn the briefing pattern",
      purpose: "This makes every tool below sharper — context, job, constraints, output, follow-up.",
      instruction: "Open Briefing method and read the briefing anatomy." },
    { position: 3, step_kind: "first_prompt", foundation_slug: null, tool_slug: primary,
      title: `Write your first proper brief in ${p}`,
      purpose: `You picked ${p} as your starting tool. Give it the structured brief it needs.`,
      instruction: "Open your stack, copy the first-prompt template, replace the bracketed parts." },
    { position: 4, step_kind: "compare", foundation_slug: null, tool_slug: second,
      title: `Try the same brief in ${s}`,
      purpose: "Same brief, different model. Notice what changes.",
      instruction: `Run your brief from step 3 in ${s}. Compare the outputs side-by-side.` },
    { position: 5, step_kind: "audit", foundation_slug: "rules-with-ai", tool_slug: null,
      title: "Check the answer before trusting it",
      purpose: "AI confidently produces wrong answers. The audit prompt is the habit that catches them.",
      instruction: "Use the audit prompt on whichever answer felt strongest." },
    { position: 6, step_kind: "review", foundation_slug: null, tool_slug: null,
      title: "Save the prompt you'd actually reuse",
      purpose: "A prompt that works once is worth keeping.",
      instruction: "Save your best brief to Saved. Come back to it next week." },
  ];
}

function buildComfortable(primary: string): Step[] {
  const p = toolName(primary);
  return [
    { position: 1, step_kind: "briefing", foundation_slug: "master-prompt-guide", tool_slug: null,
      title: "Tighten your briefing method",
      purpose: "You already get answers. This step makes them repeatable.",
      instruction: "Re-read the briefing pattern. Note one thing you do badly." },
    { position: 2, step_kind: "compare", foundation_slug: null, tool_slug: primary,
      title: "Run a same-brief comparison",
      purpose: "Same brief, different models. The point isn't which wins — it's learning what each one is good at.",
      instruction: `Pick a real task. Brief it once. Run it through ${p} and one other.` },
    { position: 3, step_kind: "relay", foundation_slug: "the-process", tool_slug: null,
      title: "Build your first two-tool relay",
      purpose: "Capture → structure → refine. The four-step loop is what scales.",
      instruction: "Read The Process foundational. Pick one relay to try this week." },
    { position: 4, step_kind: "audit", foundation_slug: "rules-with-ai", tool_slug: null,
      title: "Add an audit loop",
      purpose: "Confidence + speed without an audit is where AI goes wrong.",
      instruction: "Audit your last output against the seven rules. Note what you'd change." },
    { position: 5, step_kind: "capture", foundation_slug: null, tool_slug: "granola",
      title: "Connect capture to memory",
      purpose: "Stop losing context. Granola → Claude → Obsidian is the loop.",
      instruction: "Capture your next meeting. Distil with Claude. Save to wherever your notes live." },
    { position: 6, step_kind: "build", foundation_slug: null, tool_slug: "lovable",
      title: "Turn the system into one working artefact",
      purpose: "A system isn't real until you've built something with it.",
      instruction: "Open Lovable. Brief one small thing. Ship it." },
  ];
}

const STEP_KIND_TO_CHUNK_TYPES: Record<string, string[]> = {
  rules: ["intro", "why-it-matters"],
  briefing: ["intro", "workflow-example"],
  first_prompt: ["first-prompt"],
  compare: ["first-prompt"],
  audit: ["workflow-example", "common-mistake"],
  relay: ["workflow-example"],
  capture: ["setup", "workflow-example"],
  build: ["setup", "workflow-example"],
  review: [],
};

async function resolvePrimaryChunkId(step: Step): Promise<string | null> {
  const types = STEP_KIND_TO_CHUNK_TYPES[step.step_kind] ?? [];
  if (types.length === 0) return null;
  const slug = step.foundation_slug ?? step.tool_slug;
  if (!slug) return null;

  const { data: tool } = await admin.from("tools").select("id").eq("slug", slug).maybeSingle();
  if (!tool?.id) return null;

  const { data: chunks } = await admin
    .from("chunks")
    .select("id, chunk_type, priority")
    .eq("tool_id", tool.id)
    .in("chunk_type", types)
    .order("priority", { ascending: false })
    .limit(1);

  return chunks?.[0]?.id ?? null;
}

async function enrichWithAi(
  steps: Step[],
  ctx: { name: string; role: string | null; useCase: string; timeBudget: string | null },
): Promise<Step[]> {
  if (!LOVABLE_API_KEY) return steps;

  const system = `You are personalising a 6-step learning plan for ${ctx.name || "the user"}. They are ${ctx.role ?? "unspecified role"}, working on ${ctx.useCase}, with ${ctx.timeBudget ?? "unspecified"} time per week.

Below are 6 default steps. Return EXACTLY 6 objects in a JSON array, each with "title", "purpose", "instruction" fields, subtly personalised to their context. Keep UK English. No hype words (no "revolutionary", "supercharge", "leverage", "transform", "elevate", "unleash"). Keep the meaning of each step intact — only personalise tone and reference their use case where natural. Do not change step ordering.

Default steps:
${JSON.stringify(steps.map((s) => ({ position: s.position, title: s.title, purpose: s.purpose, instruction: s.instruction })), null, 2)}

Output strict JSON: { "steps": [{ "title": "...", "purpose": "...", "instruction": "..." }, ...] }`;

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
          { role: "user", content: "Personalise these 6 steps. JSON only." },
        ],
        response_format: { type: "json_object" },
      }),
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.log("enrich: gateway non-ok", res.status);
      return steps;
    }
    const payload = await res.json();
    const content: string = payload?.choices?.[0]?.message?.content ?? "";
    const parsed = JSON.parse(content);
    const arr = parsed?.steps;
    if (!Array.isArray(arr) || arr.length !== 6) return steps;
    return steps.map((s, i) => {
      const e = arr[i];
      if (!e || typeof e.title !== "string" || typeof e.purpose !== "string" || typeof e.instruction !== "string") return s;
      return { ...s, title: e.title, purpose: e.purpose, instruction: e.instruction };
    });
  } catch (e) {
    clearTimeout(timeout);
    console.log("enrich: error", e);
    return steps;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { session_id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const sessionId = body.session_id;
  if (!sessionId || !isValidUuid(sessionId)) return json({ error: "Invalid session id" }, 400);

  // Short-circuit if a plan already exists for this session.
  const { data: existingPlan } = await admin
    .from("learning_plans")
    .select("id, current_step_id")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existingPlan) {
    return json({
      plan_id: existingPlan.id,
      current_step_id: existingPlan.current_step_id,
      idempotent: true,
    });
  }

  const { data: session, error: sessErr } = await admin
    .from("sessions")
    .select("name, q2_audience, q3_use_case, q3_other_text, q4_confidence, onboarding_role, onboarding_time_budget, onboarding_existing_tools, ai_picked_tools, user_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessErr || !session) return json({ error: "Session not found" }, 404);

  const picks: string[] = (session.ai_picked_tools as string[] | null) ?? [];
  if (!picks.length) return json({ error: "No ai_picked_tools yet", skipped: true }, 200);

  // Lane inference
  const existing = (session.onboarding_existing_tools as string[] | null) ?? [];
  const hasExisting = existing.some((t) => t && t !== "nothing-yet");
  const conf = session.q4_confidence as string | null;
  const lane: "starting" | "comfortable" =
    hasExisting && (conf === "weekly" || conf === "confident") ? "comfortable"
    : (conf === "never" || conf === "tried") ? "starting"
    : "starting";

  const primary = picks[0];
  const second = picks[1] ?? picks[0];

  let steps = lane === "starting" ? buildStarting(primary, second) : buildComfortable(primary);

  // Resolve chunks
  for (const step of steps) {
    try {
      (step as any).primary_chunk_id = await resolvePrimaryChunkId(step);
    } catch {
      (step as any).primary_chunk_id = null;
    }
  }

  // Optional AI enrichment
  const useCase = session.q3_use_case === "other"
    ? (session.q3_other_text as string ?? "their work")
    : (session.q3_use_case as string ?? "their work");
  steps = await enrichWithAi(steps, {
    name: (session.name as string) ?? "",
    role: (session.onboarding_role as string | null) ?? null,
    useCase,
    timeBudget: (session.onboarding_time_budget as string | null) ?? null,
  });

  const title = lane === "starting"
    ? `Your starting plan — 6 steps`
    : `Your relay plan — 6 steps`;

  // Insert plan
  const { data: plan, error: planErr } = await admin
    .from("learning_plans")
    .insert({
      session_id: sessionId,
      user_id: session.user_id,
      lane,
      title,
      active_tool_slugs: picks,
      rationale: { source: "create-learning-plan", lane_reason: { hasExisting, confidence: conf } },
    })
    .select("id")
    .single();

  if (planErr || !plan) {
    console.log("plan insert failed", planErr);
    return json({ error: "Failed to create plan" }, 500);
  }

  // Insert steps
  const stepRows = steps.map((s) => ({
    plan_id: plan.id,
    position: s.position,
    step_kind: s.step_kind,
    foundation_slug: s.foundation_slug,
    tool_slug: s.tool_slug,
    title: s.title,
    purpose: s.purpose,
    instruction: s.instruction,
    primary_chunk_id: (s as any).primary_chunk_id ?? null,
    status: s.position === 1 ? "available" : "locked",
  }));

  const { data: insertedSteps, error: stepsErr } = await admin
    .from("learning_plan_steps")
    .insert(stepRows)
    .select("id, position");

  if (stepsErr || !insertedSteps) {
    console.error("create-learning-plan: steps insert failed, rolling back plan", stepsErr);
    await admin.from("learning_plans").delete().eq("id", plan.id);
    return json({ error: "Failed to create plan steps" }, 500);
  }

  const firstStep = insertedSteps.find((r) => r.position === 1);
  const currentStepId = firstStep?.id ?? null;

  if (currentStepId) {
    await admin.from("learning_plans").update({ current_step_id: currentStepId }).eq("id", plan.id);
  }

  // Log event
  await admin.from("learning_events").insert({
    plan_id: plan.id,
    step_id: currentStepId,
    user_id: session.user_id,
    event_type: "plan_created",
    payload: { lane, picks, step_count: insertedSteps.length },
  });

  return json({ plan_id: plan.id, current_step_id: currentStepId });
});
