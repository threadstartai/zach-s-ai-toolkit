import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, isValidUuid, sanitiseString } from "../_shared/validation.ts";

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

  const userId = await userIdFromAuthHeader(req);
  if (!userId) return json({ error: "Unauthorised" }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const sessionId = body.session_id;
  const conversationIdInput = body.conversation_id;
  const messageText = sanitiseString(body.message, 2000);

  if (!isValidUuid(sessionId)) return json({ error: "Invalid session id" }, 400);
  if (!messageText || messageText.length < 1) return json({ error: "Empty message" }, 400);
  if (conversationIdInput !== undefined && conversationIdInput !== null && !isValidUuid(conversationIdInput)) {
    return json({ error: "Invalid conversation id" }, 400);
  }

  // Per-user rate limit: 30/hour
  const { data: allowed, error: rlErr } = await admin.rpc("check_rate_limit", {
    p_identifier: `user:${userId}`,
    p_action: "ask_stack",
    p_max_count: 30,
    p_window_seconds: 3600,
  });
  if (rlErr) return json({ error: "Rate limit check failed" }, 500);
  if (!allowed) return json({ error: "Rate limit exceeded" }, 429);

  // Verify session belongs to user
  const { data: session, error: sessErr } = await admin
    .from("sessions")
    .select("id, user_id, name, q2_audience, q3_use_case, q3_other_text, q4_confidence, ai_picked_tools, ai_pick_reasoning")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessErr) return json({ error: "Session lookup failed" }, 500);
  if (!session) return json({ error: "Session not found" }, 404);
  if (session.user_id !== userId) return json({ error: "Forbidden" }, 403);

  // Fetch user's current state in parallel
  const [planRes, savedRes, notesRes] = await Promise.all([
    admin
      .from("learning_plans")
      .select("id, title, lane, current_step_id, plan_version")
      .eq("session_id", sessionId)
      .maybeSingle(),
    admin
      .from("saved_chunks")
      .select("created_at, chunks(title, chunk_type, tools(name))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    admin
      .from("notes")
      .select("title, summary, pinned, updated_at")
      .eq("user_id", userId)
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const plan = planRes.data;
  const savedChunks = savedRes.data;
  const notes = notesRes.data;

  let currentStep: any = null;
  let recentSteps: any[] = [];
  if (plan) {
    const { data: steps } = await admin
      .from("learning_plan_steps")
      .select("id, position, title, purpose, status, completed_at, tool_slug, step_kind")
      .eq("plan_id", plan.id)
      .order("position", { ascending: true });

    if (steps) {
      currentStep =
        steps.find((s: any) => s.id === plan.current_step_id) ??
        steps.find((s: any) => s.status === "available") ??
        null;
      recentSteps = steps.filter((s: any) => s.status === "done" || s.status === "skipped").slice(-3);
    }
  }

  let conversationId: string;
  let history: { role: string; content: string }[] = [];

  if (conversationIdInput) {
    const { data: convo, error: cErr } = await admin
      .from("conversations")
      .select("id, user_id")
      .eq("id", conversationIdInput as string)
      .maybeSingle();
    if (cErr) return json({ error: "Conversation lookup failed" }, 500);
    if (!convo || convo.user_id !== userId) return json({ error: "Forbidden" }, 403);
    conversationId = convo.id;

    const { data: msgs } = await admin
      .from("messages")
      .select("role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(10);
    history = (msgs ?? []).reverse().map((m: any) => ({ role: m.role, content: m.content }));
  } else {
    const title = messageText.slice(0, 80);
    const { data: newConvo, error: nErr } = await admin
      .from("conversations")
      .insert({ session_id: sessionId, user_id: userId, title })
      .select("id")
      .single();
    if (nErr || !newConvo) return json({ error: "Failed to create conversation" }, 500);
    conversationId = newConvo.id;
  }

  // Fetch picked tools (if AI picks present)
  let toolBlocks = "";
  const slugs: string[] = Array.isArray(session.ai_picked_tools) ? session.ai_picked_tools : [];
  const reasoning: Record<string, string> = (session.ai_pick_reasoning ?? {}) as Record<string, string>;

  if (slugs.length > 0) {
    const { data: tools } = await admin
      .from("tools")
      .select("id, slug, name, tagline")
      .in("slug", slugs);

    if (tools && tools.length > 0) {
      // Order tools by the slugs array order
      const orderedTools = slugs
        .map((s) => tools.find((t: any) => t.slug === s))
        .filter(Boolean) as any[];

      const audience = session.q2_audience as string;
      const useCase = session.q3_use_case as string;
      const confidence = session.q4_confidence as string;

      const blocks: string[] = [];
      for (let i = 0; i < orderedTools.length; i++) {
        const t = orderedTools[i];
        const reason = reasoning[t.slug] ?? t.tagline ?? "";
        blocks.push(`${i + 1}. ${t.name} — ${reason}`);
      }

      const toolIds = orderedTools.map((t: any) => t.id);
      let q = admin
        .from("chunks")
        .select("title, content, chunk_type, priority, tool_id, tags_audience, tags_use_case, tags_confidence")
        .in("tool_id", toolIds)
        .contains("tags_audience", [audience])
        .contains("tags_confidence", [confidence])
        .order("priority", { ascending: false });

      if (useCase && useCase !== "other") {
        q = q.contains("tags_use_case", [useCase]);
      }

      const { data: allChunks } = await q;

      const chunkBlocks: string[] = [];
      for (const t of orderedTools) {
        const tChunks = (allChunks ?? [])
          .filter((c: any) => c.tool_id === t.id)
          .slice(0, 3);
        for (const c of tChunks) {
          const snippet = (c.content ?? "").slice(0, 400);
          chunkBlocks.push(`## ${t.name} — ${c.title ?? c.chunk_type}\n${snippet}`);
        }
      }

      toolBlocks = `Their three tools (in priority order):\n${blocks.join("\n")}\n\nKey chunks they're seeing on their stack:\n${chunkBlocks.join("\n\n")}`;
    }
  }

  const audienceLabel = Q2_LABELS[session.q2_audience as string] ?? session.q2_audience ?? "unknown";
  const useCaseLabel = session.q3_use_case === "other"
    ? `free text — "${session.q3_other_text ?? ""}"`
    : (Q3_LABELS[session.q3_use_case as string] ?? session.q3_use_case ?? "unknown");
  const confidenceLabel = Q4_LABELS[session.q4_confidence as string] ?? session.q4_confidence ?? "unknown";

  let stateBlock = "";

  if (plan && currentStep) {
    stateBlock += `\nWhere they are right now:\n- Plan: ${plan.title} (${plan.lane} lane).\n- Current step: ${currentStep.position}. ${currentStep.title}\n- Why this step: ${currentStep.purpose}\n`;
  }

  if (recentSteps.length > 0) {
    const done = recentSteps.filter((s: any) => s.status === "done").map((s: any) => `Step ${s.position}: ${s.title}`);
    const skipped = recentSteps.filter((s: any) => s.status === "skipped").map((s: any) => `Step ${s.position}: ${s.title}`);
    if (done.length) stateBlock += `- Recently done: ${done.join("; ")}\n`;
    if (skipped.length) stateBlock += `- Recently skipped: ${skipped.join("; ")}\n`;
  }

  if (savedChunks && savedChunks.length > 0) {
    const lines = savedChunks
      .filter((s: any) => s.chunks)
      .map((s: any) => {
        const toolName = s.chunks?.tools?.name ?? "Unknown";
        const title = s.chunks?.title ?? s.chunks?.chunk_type ?? "Untitled";
        return `${toolName} — ${title}`;
      });
    if (lines.length) stateBlock += `\nThings they saved recently:\n- ${lines.join("\n- ")}\n`;
  }

  if (notes && notes.length > 0) {
    const lines = notes
      .filter((n: any) => n.title || n.summary)
      .map((n: any) => {
        const pin = n.pinned ? "[pinned] " : "";
        const title = n.title || "Untitled note";
        const summary = n.summary ? ` — ${n.summary}` : "";
        return `${pin}${title}${summary}`;
      });
    if (lines.length) stateBlock += `\nWhat's in their notes:\n- ${lines.join("\n- ")}\n`;
  }

  const systemPrompt = `You're Ask AI — an assistant helping ${session.name || "this user"} understand their personalised AI stack from MY AI STACK.

Their profile:
- Audience: ${audienceLabel}
- Use case: ${useCaseLabel}
- AI confidence: ${confidenceLabel}

${toolBlocks || "(No specific tools selected yet — answer generally about the MY AI STACK approach.)"}
${stateBlock}
How to help them:
- Use the Master Prompt Guide approach. Ask up to 3 clarifying questions before giving generic advice. Push back where they're being lazy or unclear. After landing an answer, audit it: what's weak, what did you assume.
- Stay grounded in the chunks above AND in the user's current state. If they ask "what should I do next?", point to their current step. If they ask about something they saved, reference the actual saved chunk. If they reference a note they wrote, use the title/summary as context.
- If they ask about a tool not in their stack, say "that's not in your stack — try [tool from their stack] for that, or take a quiz again."
- UK English. No hype words. No fake encouragement. Be direct and warm.
- Sign off as Ask AI, not Zach.`;

  if (!LOVABLE_API_KEY) return json({ error: "AI gateway not configured" }, 502);

  const aiMessages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: messageText },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let assistantContent = "";
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
        messages: aiMessages,
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.log("ask-stack: gateway non-ok", res.status, errText);
      if (res.status === 429) return json({ error: "AI is busy. Try again shortly." }, 429);
      if (res.status === 402) return json({ error: "AI credits exhausted." }, 402);
      return json({ error: "Couldn't reach the assistant. Try again." }, 502);
    }
    const payload = await res.json();
    assistantContent = payload?.choices?.[0]?.message?.content ?? "";
    if (!assistantContent) return json({ error: "Couldn't reach the assistant. Try again." }, 502);
  } catch (e) {
    clearTimeout(timeout);
    console.log("ask-stack: gateway error", e);
    return json({ error: "Couldn't reach the assistant. Try again." }, 502);
  }

  const { data: insertedMessages, error: msgErr } = await admin
    .from("messages")
    .insert([
      { conversation_id: conversationId, role: "user", content: messageText },
      { conversation_id: conversationId, role: "assistant", content: assistantContent },
    ])
    .select("id, role, created_at")
    .order("created_at", { ascending: true });

  if (msgErr || !insertedMessages || insertedMessages.length !== 2) {
    console.error("ask-stack: message persistence failed", msgErr);
    return json({ error: "Failed to save message. Try again." }, 500);
  }

  const assistantMessageId = insertedMessages.find((m: any) => m.role === "assistant")?.id ?? null;


  return json({
    conversation_id: conversationId,
    message_id: assistantMessageId,
    content: assistantContent,
  });
});
