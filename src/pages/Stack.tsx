import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SiteLayout from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

type Tool = {
  num?: string;
  name: string;
  tagline: string;
  slug: string;
};

type CategoryData = {
  title: string;
  blurb: string;
  tools: Tool[];
};

const categories: CategoryData[] = [
  {
    title: "Foundationals",
    blurb: "The seven docs that make the rest of the Stack make sense.",
    tools: [
      { num: "00", name: "Start Here", tagline: "Where to begin and what order to read.", slug: "00-start-here" },
      { num: "01", name: "Why I Made This", tagline: "The honest reason this exists.", slug: "01-why-i-made-this" },
      { num: "02", name: "The Process", tagline: "The four-step loop I use for almost everything.", slug: "02-the-process" },
      { num: "03", name: "How This Was Built", tagline: "Behind the scenes.", slug: "03-how-this-was-built" },
      { name: "The Master Prompt Guide", tagline: "The prompt patterns worth memorising.", slug: "master-prompt-guide" },
      { name: "Power-Ups", tagline: "Small upgrades that make a big difference.", slug: "power-ups" },
      { name: "Pass This On", tagline: "Who this is for, and how to share it.", slug: "pass-this-on" },
    ],
  },
  {
    title: "Thinking & Writing",
    blurb: "Tools that help you think clearly and write better.",
    tools: [
      { num: "01", name: "Claude", tagline: "The thinking partner. Start here.", slug: "claude" },
      { num: "02", name: "Claude Code", tagline: "Claude in your terminal. For bigger work.", slug: "claude-code" },
      { num: "03", name: "Co-Pilot", tagline: "Claude inside Excel, Word, PowerPoint.", slug: "co-pilot" },
      { num: "04", name: "ChatGPT", tagline: "The all-rounder. Best mobile experience.", slug: "chatgpt" },
      { num: "05", name: "Grok", tagline: "When timing matters. Live news, real-time data.", slug: "grok" },
    ],
  },
  {
    title: "Research & Study",
    blurb: "Tools for going deep on a topic.",
    tools: [
      { num: "06", name: "Gemini", tagline: "Google's research assistant. Connected to Drive and Workspace.", slug: "gemini" },
      { num: "07", name: "Perplexity", tagline: "The research engine. Cited answers.", slug: "perplexity" },
      { num: "08", name: "Manus", tagline: "The connected work agent. For longer tasks.", slug: "manus" },
      { num: "09", name: "NotebookLM", tagline: "Turn any source into notes, audio, mind maps.", slug: "notebooklm" },
    ],
  },
  {
    title: "Building Things",
    blurb: "Tools for making websites, apps, content, video and images.",
    tools: [
      { name: "Building Things — Overview", tagline: "The whole landscape, in one place.", slug: "building-things-overview" },
      { num: "10", name: "Lovable", tagline: "Build a website by talking to AI.", slug: "lovable" },
      { num: "11", name: "Base44", tagline: "Build internal tools and apps.", slug: "base44" },
      { num: "12", name: "Higgsfield", tagline: "AI video that's actually good.", slug: "higgsfield" },
      { num: "13", name: "Artlist", tagline: "Music, sound, footage for anything you make.", slug: "artlist" },
      { num: "14", name: "Nano Banana & Veo", tagline: "Image and video generation, the current best.", slug: "nano-banana-veo" },
    ],
  },
  {
    title: "Daily Life",
    blurb: "Tools that fit into how you already work.",
    tools: [
      { num: "15", name: "Wispr Flow", tagline: "Voice-to-text. Faster than typing.", slug: "wispr-flow" },
      { num: "16", name: "Granola", tagline: "Meeting notes that write themselves.", slug: "granola" },
      { num: "17", name: "Obsidian", tagline: "Your second brain. Local, yours, forever.", slug: "obsidian" },
    ],
  },
];

const ToolRow = ({ tool }: { tool: Tool }) => (
  <div className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-3 py-3 -mx-3 rounded-[8px] transition-colors duration-150 hover:bg-navy-light">
    <div className="flex items-baseline gap-3 sm:w-[230px] sm:shrink-0">
      {tool.num && (
        <span className="font-mono text-[13px] text-navy/70">{tool.num}</span>
      )}
      <span className="font-semibold text-navy">{tool.name}</span>
    </div>
    <p className="flex-1 text-[15px] text-foreground/80">{tool.tagline}</p>
  </div>
);

const Category = ({ data }: { data: CategoryData }) => (
  <section className="mt-16 first:mt-0">
    <h3 className="text-[24px] font-bold text-navy">{data.title}</h3>
    <p className="mt-2 italic text-foreground/75">{data.blurb}</p>
    <div className="mt-6 flex flex-col gap-1">
      {data.tools.map((t) => (
        <ToolRow key={t.slug} tool={t} />
      ))}
    </div>
  </section>
);

type QuizStep = "intro" | "q1" | "q2" | "q3" | "q4" | "q5" | "done";

// ---------- Result engine ----------

type ToolKey =
  | "01" | "02" | "03" | "04" | "06" | "07" | "08" | "09"
  | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17";

const TOOLS: Record<ToolKey, { num: string; name: string; tagline: string; slug: string }> = {
  "01": { num: "01", name: "Claude", tagline: "The thinking partner. Start here.", slug: "claude" },
  "02": { num: "02", name: "Claude Code", tagline: "Claude in your terminal. For bigger work.", slug: "claude-code" },
  "03": { num: "03", name: "Co-Pilot", tagline: "Claude inside Excel, Word, PowerPoint.", slug: "co-pilot" },
  "04": { num: "04", name: "ChatGPT", tagline: "The all-rounder. Best mobile experience.", slug: "chatgpt" },
  "06": { num: "06", name: "Gemini", tagline: "Google's research assistant. Connected to Drive and Workspace.", slug: "gemini" },
  "07": { num: "07", name: "Perplexity", tagline: "The research engine. Cited answers.", slug: "perplexity" },
  "08": { num: "08", name: "Manus", tagline: "The connected work agent. For longer tasks.", slug: "manus" },
  "09": { num: "09", name: "NotebookLM", tagline: "Turn any source into notes, audio, mind maps.", slug: "notebooklm" },
  "10": { num: "10", name: "Lovable", tagline: "Build a website by talking to AI.", slug: "lovable" },
  "11": { num: "11", name: "Base44", tagline: "Build internal tools and apps.", slug: "base44" },
  "12": { num: "12", name: "Higgsfield", tagline: "AI video that's actually good.", slug: "higgsfield" },
  "13": { num: "13", name: "Artlist", tagline: "Music, sound, footage for anything you make.", slug: "artlist" },
  "14": { num: "14", name: "Nano Banana & Veo", tagline: "Image and video generation, the current best.", slug: "nano-banana-veo" },
  "15": { num: "15", name: "Wispr Flow", tagline: "Voice-to-text. Faster than typing.", slug: "wispr-flow" },
  "16": { num: "16", name: "Granola", tagline: "Meeting notes that write themselves.", slug: "granola" },
  "17": { num: "17", name: "Obsidian", tagline: "Your second brain. Local, yours, forever.", slug: "obsidian" },
};

// Order of "advancedness" — earlier = more advanced (drop first when capping).
const ADVANCED_ORDER: ToolKey[] = ["08", "02", "11"];

type Q2Code = "student" | "personal" | "business" | "exploring";
type Q3Code = "writing" | "research" | "building" | "notes" | "images" | "admin" | "other";
type Q4Code = "never" | "tried" | "weekly" | "confident";
type Q5Code = "prompt" | "video" | "guide" | "stepbystep";

const codeQ2 = (q: string | null): Q2Code => {
  if (q === "Student") return "student";
  if (q === "Personal life / family") return "personal";
  if (q === "Business / work") return "business";
  return "exploring";
};
const codeQ3 = (q: string | null): Q3Code => {
  switch (q) {
    case "Writing something properly": return "writing";
    case "Researching a topic": return "research";
    case "Building a website or tool": return "building";
    case "Note-taking and meetings": return "notes";
    case "Generating images or video": return "images";
    case "Sorting admin or emails": return "admin";
    default: return "other";
  }
};
const codeQ4 = (q: string | null): Q4Code => {
  if (q === "Never used it") return "never";
  if (q === "Tried it a bit") return "tried";
  if (q === "Use it weekly") return "weekly";
  return "confident";
};
const codeQ5 = (q: string | null): Q5Code => {
  if (q === "Show me a video") return "video";
  if (q === "I'll read a guide") return "guide";
  if (q === "Walk me through it step by step") return "stepbystep";
  return "prompt";
};

const recommend = (q2: Q2Code, q3: Q3Code, q4: Q4Code): ToolKey[] => {
  let picks: ToolKey[] = [];
  const beginner = q4 === "never" || q4 === "tried";
  const advanced = q4 === "weekly" || q4 === "confident";

  if (q3 === "writing") {
    picks = ["01"];
    if (beginner) picks.push("04");
    if (advanced) picks.push("02");
    if (q2 === "business") picks.push("03");
  } else if (q3 === "research") {
    if (q2 === "student") picks = ["09", "06", "01"];
    else if (q2 === "business") picks = ["07", "01", "09"];
    else picks = ["06", "07", "01"];
    if (q4 === "confident") picks[2] = "08";
  } else if (q3 === "building") {
    picks = ["10"];
    if (beginner) picks.push("01");
    if (advanced) picks.push("11");
    if (q2 === "business") picks.push("03");
  } else if (q3 === "notes") {
    picks = ["16", "15"];
    picks.push(advanced ? "17" : "01");
  } else if (q3 === "images") {
    picks = ["14", "12"];
    picks.push(q2 === "business" ? "13" : "01");
  } else if (q3 === "admin") {
    picks = ["01", "15"];
    if (q2 === "business") picks.push("03");
    if (q4 === "confident") picks.push("08");
  } else {
    picks = ["01", "04", "09"];
  }

  // Dedupe preserving order.
  picks = Array.from(new Set(picks));

  // Cap at 3, dropping most advanced first.
  while (picks.length > 3) {
    const drop = ADVANCED_ORDER.find((k) => picks.includes(k));
    if (!drop) { picks.pop(); continue; }
    picks = picks.filter((k) => k !== drop);
  }
  return picks;
};

const whyFor = (key: ToolKey, q2: Q2Code): string => {
  switch (key) {
    case "01":
      if (q2 === "student") return "Because thinking through essays, plans and ideas is what Claude does best.";
      if (q2 === "business") return "Because you'll use it daily once it's set up properly.";
      if (q2 === "personal") return "Because it's the AI you'll keep coming back to for everything.";
      return "Because every AI workflow starts with one good thinking partner.";
    case "02":
      return "Because once you're comfortable, this is where the real depth opens up.";
    case "03":
      return "Because it lives inside Excel, Word and PowerPoint — where business work actually happens.";
    case "04":
      // Q4 nuance is handled separately when called.
      return "Because it's the easiest place to start. No setup, just ask.";
    case "06":
      if (q2 === "student") return "Because it sits inside Google Workspace where your work already is.";
      return "Because it's the AI hooked into Drive, Docs and your Google life.";
    case "07":
      return "Because answers with citations beat answers without.";
    case "08":
      return "Because once you trust AI, you can hand it real work to do.";
    case "09":
      if (q2 === "student") return "Because cramming gets easier when AI knows your sources.";
      return "Because feeding sources to AI changes how research works.";
    case "10":
      return "Because you describe what you want and it builds it. No code needed.";
    case "11":
      return "Because once Lovable clicks, this is where you build the harder stuff.";
    case "12":
      return "Because AI video has finally crossed the line from gimmick to useful.";
    case "13":
      return "Because every video needs music and footage you can actually use.";
    case "14":
      return "Because the current best image and video generators sit here.";
    case "15":
      return "Because typing slows you down. Talking is faster.";
    case "16":
      if (q2 === "business") return "Because nobody actually writes good meeting notes. This does.";
      return "Because meeting notes write themselves now. Use the time elsewhere.";
    case "17":
      return "Because once you're storing ideas long-term, this is where they live.";
  }
};

const whyForChatGPT = (q4: Q4Code): string => {
  if (q4 === "tried") return "Because the mobile experience is the best, and you'll use it on the go.";
  return "Because it's the easiest place to start. No setup, just ask.";
};

// "Why you're seeing this" — personalisation transparency line per tool card.
const audiencePhrase = (q2: Q2Code): string => {
  if (q2 === "student") return "you're a student";
  if (q2 === "personal") return "this is for personal life";
  if (q2 === "business") return "this is for business or work";
  return "you're exploring AI";
};
const useCasePhrase = (q3: Q3Code, q3OtherText: string): string => {
  if (q3 === "writing") return "writing";
  if (q3 === "research") return "research";
  if (q3 === "building") return "building things";
  if (q3 === "notes") return "note-taking and meetings";
  if (q3 === "images") return "images and video";
  if (q3 === "admin") return "admin and emails";
  // other — sanitise free text: strip HTML, lowercase, max 80 chars.
  const cleaned = (q3OtherText || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .slice(0, 80);
  return cleaned ? `"${cleaned}"` : "what you're working on";
};
const confidencePhrase = (q4: Q4Code): string => {
  if (q4 === "never") return "starting from scratch";
  if (q4 === "tried") return "with a bit of experience";
  if (q4 === "weekly") return "using AI regularly";
  return "comfortable enough to push it further";
};
const whyThisTool = (
  slug: string,
  q2: Q2Code,
  q3: Q3Code,
  q4: Q4Code,
  q3OtherText: string,
): string => {
  const aud = audiencePhrase(q2);
  const use = useCasePhrase(q3, q3OtherText);
  const conf = confidencePhrase(q4);

  if (slug === "claude") {
    return `Because ${aud}, thinking through ${use}, Claude is where everyone starts.`;
  }
  if (slug === "chatgpt" && (q4 === "never" || q4 === "tried")) {
    return `Because the easiest way in for ${use} is ChatGPT, especially ${conf}.`;
  }
  if (slug === "lovable" && q3 === "building") {
    return `Because building things is what Lovable was made for, and ${conf} is the right level to start.`;
  }
  if (slug === "wispr-flow") {
    return `Because typing slows down ${use} more than people realise.`;
  }
  if (slug === "notebooklm" && q2 === "student") {
    return `Because students working on ${use} benefit most from feeding sources to AI.`;
  }
  if (slug === "perplexity" && q3 === "research") {
    return `Because ${use} is where cited answers beat uncited ones.`;
  }
  if (slug === "manus" && q4 === "confident") {
    return `Because at ${conf} level, you can hand longer ${use} tasks off entirely.`;
  }
  return `Because ${aud}, working on ${use}, ${conf}.`;
};

const introQ2 = (q2: Q2Code) =>
  q2 === "student" ? "Built for student work"
  : q2 === "personal" ? "Built for personal life and family"
  : q2 === "business" ? "Built for business and work"
  : "Built for exploring AI";

const introQ4 = (q4: Q4Code) =>
  q4 === "never" ? "starting from never having used AI"
  : q4 === "tried" ? "starting from a bit of experience"
  : q4 === "weekly" ? "starting from regular use"
  : "starting from a confident base";

const isMeaningfulName = (raw: string) => {
  const n = raw.trim();
  if (n.length < 2) return false;
  if (!/^[A-Za-z][A-Za-z'\- ]*$/.test(n)) return false;
  if (!/[aeiouy]/i.test(n)) return false;
  return true;
};

const LADDER = [
  { name: "Ask better questions.", desc: "Stop dumping vague briefs. Start saying what you actually want." },
  { name: "Add context.", desc: "Give the AI what it needs to be useful — examples, your style, the constraints." },
  { name: "Check the answer.", desc: "Don't trust the first reply. Ask what's weak about it." },
  { name: "Reuse what works.", desc: "When a prompt lands, save it. Build a small library that's yours." },
  { name: "Automate the boring bits.", desc: "Once you've got patterns that work, get them running on autopilot." },
];

const ladderLine = (c4: Q4Code): string => {
  if (c4 === "never") return "You're at Stage 1. That's where everyone starts.";
  if (c4 === "tried") return "You're between Stage 1 and 2. The next move is adding context.";
  if (c4 === "weekly") return "You're around Stage 2 or 3. The next move is checking what AI tells you.";
  return "You're past Stage 3. The next moves are reuse and automation — most people never get here.";
};

const Q5_EDGE_MAP: Record<Q5Code, string> = {
  prompt: "prompt",
  video: "video",
  guide: "guide",
  stepbystep: "step-by-step",
};

type Chunk = {
  id: string;
  tool_id: string;
  chunk_type: string;
  title: string | null;
  content: string;
  priority: number;
};

// Split a first-prompt chunk into parts: text before the blockquote, the
// blockquote text itself (the prompt to copy), and text after the blockquote.
const splitFirstPrompt = (content: string) => {
  const lines = content.split("\n");
  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    const isQuote = /^>\s?/.test(lines[i]);
    if (isQuote && start === -1) start = i;
    if (start !== -1 && !isQuote && lines[i].trim() === "") continue;
    if (start !== -1 && !isQuote) { end = i; break; }
  }
  if (start === -1) return { before: content, prompt: null as string | null, after: "" };
  if (end === -1) end = lines.length;
  const before = lines.slice(0, start).join("\n").trim();
  const prompt = lines.slice(start, end).map((l) => l.replace(/^>\s?/, "")).join("\n").trim();
  const after = lines.slice(end).join("\n").trim();
  return { before, prompt, after };
};

const markdownComponents = {
  p: ({ node, ...props }: any) => (
    <p className="text-foreground/85 text-[15.5px] leading-[1.7] mb-3 last:mb-0" {...props} />
  ),
  strong: ({ node, ...props }: any) => <strong className="font-semibold text-navy" {...props} />,
  em: ({ node, ...props }: any) => <em className="italic" {...props} />,
  ul: ({ node, ...props }: any) => (
    <ul className="list-disc pl-5 my-3 space-y-1.5 text-foreground/85 text-[15.5px] leading-[1.7]" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal pl-5 my-3 space-y-1.5 text-foreground/85 text-[15.5px] leading-[1.7]" {...props} />
  ),
  li: ({ node, ...props }: any) => <li {...props} />,
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      className="my-3 border-l-[3px] border-navy pl-4 italic text-foreground/85 text-[15.5px] leading-[1.7]"
      {...props}
    />
  ),
  code: ({ node, ...props }: any) => (
    <code className="font-mono text-[13.5px] bg-background/60 px-1.5 py-0.5 rounded" {...props} />
  ),
  a: ({ node, ...props }: any) => (
    <a className="text-navy underline underline-offset-2 hover:opacity-80" {...props} />
  ),
};

const ChunkBlock = ({ chunk }: { chunk: Chunk }) => {
  const [copied, setCopied] = useState(false);

  const isFirstPrompt = chunk.chunk_type === "first-prompt";
  const split = useMemo(
    () => (isFirstPrompt ? splitFirstPrompt(chunk.content) : null),
    [isFirstPrompt, chunk.content],
  );

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      {chunk.title && (
        <h5 className="text-[15px] font-semibold text-navy mb-2">{chunk.title}</h5>
      )}
      {isFirstPrompt && split && split.prompt ? (
        <>
          {split.before && (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {split.before}
            </ReactMarkdown>
          )}
          <div className="my-3 bg-background border border-navy/[0.12] border-l-[3px] border-l-navy rounded-[8px] px-5 py-4">
            <pre className="whitespace-pre-wrap font-mono text-[13.5px] leading-[1.7] text-foreground/90">{split.prompt}</pre>
          </div>
          <button
            onClick={() => handleCopy(split.prompt!)}
            className="mt-4 inline-flex items-center justify-center border border-navy text-navy px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium hover:bg-background/60 transition-colors duration-150"
          >
            {copied ? "Copied" : "Copy prompt"}
          </button>
          {split.after && (
            <div className="mt-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {split.after}
              </ReactMarkdown>
            </div>
          )}
        </>
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {chunk.content}
        </ReactMarkdown>
      )}
    </div>
  );
};

// ---------- Result component ----------

const SECTION_LABELS: { key: "why" | "tonight" | "worth"; label: string; types: string[] }[] = [
  { key: "why", label: "WHY", types: ["intro", "why-it-matters"] },
  { key: "tonight", label: "TONIGHT", types: ["setup", "first-prompt", "workflow-example"] },
  { key: "worth", label: "WORTH KNOWING", types: ["advanced", "common-mistake"] },
];

const groupChunks = (chunks: Chunk[]) => {
  const groups: Record<string, Chunk[]> = { why: [], tonight: [], worth: [] };
  for (const c of chunks) {
    for (const s of SECTION_LABELS) {
      if (s.types.includes(c.chunk_type)) {
        groups[s.key].push(c);
        break;
      }
    }
  }
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }
  return groups;
};

const Result = ({
  name, q2, q3, q4, q5, onReset, initialSessionId, sharedMode,
}: {
  name: string;
  q2: string | null;
  q3: string | null;
  q4: string | null;
  q5: string | null;
  onReset: () => void;
  initialSessionId?: string;
  sharedMode?: boolean;
}) => {
  const [saved, setSaved] = useState(false);
  const [chunksByTool, setChunksByTool] = useState<Record<string, Chunk[]>>({});
  const [showSlowMessage, setShowSlowMessage] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [linkCopied, setLinkCopied] = useState(false);

  const c2 = codeQ2(q2);
  const c3 = codeQ3(q3);
  const c4 = codeQ4(q4);
  const c5 = codeQ5(q5);

  const displayName = isMeaningfulName(name) ? name.trim() : null;
  const title = displayName ? `${displayName}'s AI Stack` : "My AI Stack";

  const picks = useMemo(() => recommend(c2, c3, c4), [c2, c3, c4]);
  const pickSlugs = useMemo(() => picks.map((k) => TOOLS[k].slug), [picks]);

  // Submit session via edge function — skip if we already have a sessionId (shared link load).
  useEffect(() => {
    if (initialSessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("submit-quiz", {
          body: {
            name: displayName ?? "Anonymous",
            q2_audience: c2,
            q3_use_case: c3,
            q3_other_text: c3 === "other" ? (q3 ?? "") : "",
            q4_confidence: c4,
            q5_learning_style: Q5_EDGE_MAP[c5],
          },
        });
        if (!cancelled && !error && data?.session_id) {
          setSessionId(data.session_id);
          // Update the URL so it's shareable, without a reload.
          const target = `/stack/result/${data.session_id}`;
          if (typeof window !== "undefined" && window.location.pathname !== target) {
            window.history.pushState(null, "", target);
          }
        }
      } catch {
        // non-fatal
      }
    })();
    return () => { cancelled = true; };
  }, [initialSessionId, displayName, c2, c3, c4, c5, q3]);

  // Load chunks for each picked tool.
  useEffect(() => {
    let cancelled = false;
    const slowTimer = setTimeout(() => { if (!cancelled) setShowSlowMessage(true); }, 300);

    (async () => {
      const { data: tools } = await supabase
        .from("tools")
        .select("id, slug")
        .in("slug", pickSlugs);

      if (!tools || cancelled) return;
      const slugToId = new Map(tools.map((t) => [t.slug, t.id]));

      const result: Record<string, Chunk[]> = {};
      await Promise.all(
        pickSlugs.map(async (slug) => {
          const toolId = slugToId.get(slug);
          if (!toolId) { result[slug] = []; return; }
          const { data: rows } = await supabase
            .from("chunks")
            .select("id, tool_id, chunk_type, title, content, priority, tags_audience, tags_use_case, tags_confidence")
            .eq("tool_id", toolId);

          const filtered = (rows ?? []).filter((r: any) => {
            const a: string[] = r.tags_audience ?? [];
            const u: string[] = r.tags_use_case ?? [];
            const co: string[] = r.tags_confidence ?? [];
            const audOk = a.length === 0 || a.includes(c2) || a.includes("all");
            const useOk = c3 === "other" || u.length === 0 || u.includes(c3) || u.includes("all");
            const confOk = co.length === 0 || co.includes(c4) || co.includes("all");
            return audOk && useOk && confOk;
          });
          filtered.sort((a: any, b: any) => (b.priority ?? 0) - (a.priority ?? 0));

          // Diversity selection: bucket all matching chunks, then pick the
          // highest-priority chunk from each non-empty section. Up to 3 total.
          const grouped: Record<string, Chunk[]> = { why: [], tonight: [], worth: [] };
          for (const ch of filtered as Chunk[]) {
            for (const s of SECTION_LABELS) {
              if (s.types.includes(ch.chunk_type)) { grouped[s.key].push(ch); break; }
            }
          }
          const picked: Chunk[] = [];
          for (const s of SECTION_LABELS) {
            const top = grouped[s.key][0];
            if (top) picked.push(top);
          }
          result[slug] = picked;
        }),
      );
      if (!cancelled) {
        setChunksByTool(result);
        setShowSlowMessage(false);
      }
    })();

    return () => { cancelled = true; clearTimeout(slowTimer); };
  }, [pickSlugs.join("|"), c2, c3, c4]);

  const handleStartOver = () => {
    if (typeof window !== "undefined" && window.location.pathname !== "/stack") {
      window.history.pushState(null, "", "/stack");
    }
    onReset();
    setTimeout(() => {
      document.getElementById("build-my-stack")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleCopyShareLink = async () => {
    if (!sessionId || typeof window === "undefined") return;
    const url = `${window.location.origin}/stack/result/${sessionId}`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const why = (k: ToolKey) => k === "04" ? whyForChatGPT(c4) : whyFor(k, c2);

  return (
    <div>
      {/* Title + intro */}
      <h3 className="text-[32px] sm:text-[36px] font-bold text-navy tracking-[-0.02em]">{title}</h3>
      <p className="mt-3 text-navy text-[17px] leading-[1.7]">
        {introQ2(c2)}, {introQ4(c4)}. Three tools to start with — and the bits worth reading tonight.
      </p>

      {/* Jump-to nav strip */}
      {picks.length > 1 && (
        <div className="mt-8 border-t border-b border-foreground/15 py-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[14px]">
          <span className="font-mono text-navy">Jump to —</span>
          {picks.map((k, i) => {
            const t = TOOLS[k];
            return (
              <span key={k} className="flex items-baseline gap-2">
                <a
                  href={`#tool-${t.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(`tool-${t.slug}`);
                    if (el) {
                      const top = el.getBoundingClientRect().top + window.scrollY - 60;
                      window.scrollTo({ top, behavior: "smooth" });
                    }
                  }}
                  className="text-navy hover:underline underline-offset-2"
                >
                  {t.name}
                </a>
                {i < picks.length - 1 && <span className="text-foreground/40">·</span>}
              </span>
            );
          })}
        </div>
      )}

      {showSlowMessage && Object.keys(chunksByTool).length === 0 && (
        <p className="mt-6 text-[14px] text-foreground/60 italic">
          One moment — finding the right bits for you.
        </p>
      )}

      {/* Tool cards */}
      <div className="mt-10 flex flex-col gap-7">
        {picks.map((k, i) => {
          const t = TOOLS[k];
          const tChunks = chunksByTool[t.slug] ?? [];
          const grouped = groupChunks(tChunks);
          const hasAnyChunks = tChunks.length > 0;
          return (
            <Fragment key={k}>
              {i === 0 && (
                <p className="mb-3 mt-2 italic text-[14px] text-navy/75 font-medium">
                  Start here tonight ↓
                </p>
              )}
            <div
              id={`tool-${t.slug}`}
              className="bg-navy-light rounded-[12px] px-7 py-6 sm:px-8 sm:py-7 scroll-mt-[60px]"
            >
              <h4 className="text-[22px] font-bold text-navy">
                <span className="font-mono text-[15px] text-navy/70 mr-2.5">{t.num}</span>
                {t.name}
              </h4>
              <p className="mt-3 text-navy text-[16px] leading-[1.65]">{why(k)}</p>
              <p className="mt-3 mb-1 text-[13px] italic text-navy/65 leading-[1.55]">
                {whyThisTool(t.slug, c2, c3, c4, c3 === "other" ? (q3 ?? "") : "")}
              </p>

              {hasAnyChunks && (
                <div className="mt-5 flex flex-col gap-6">
                  {SECTION_LABELS.map((s) => {
                    const items = grouped[s.key];
                    if (!items || items.length === 0) return null;
                    return (
                      <div key={s.key}>
                        <div className="mt-1 mb-3">
                          <div className="font-mono text-[11px] tracking-[0.08em] text-navy">
                            {s.label}
                          </div>
                          <div className="mt-1.5 h-px w-12 bg-foreground/20" />
                        </div>
                        <div className="flex flex-col gap-4">
                          {items.map((ch) => (
                            <ChunkBlock key={ch.id} chunk={ch} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </Fragment>
          );
        })}
      </div>

      {/* Where this leads — ladder */}
      <div className="mt-20">
        <h4 className="text-[24px] font-bold text-navy">Where this leads</h4>
        <p className="mt-3 text-foreground/85 text-[16px] leading-[1.7]">
          Using AI well isn't a list of tools. It's a skill that builds in stages. Here's the ladder:
        </p>
        <ol className="mt-7 space-y-5">
          {LADDER.map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-navy text-primary-foreground flex items-center justify-center text-[14px] font-semibold">
                {i + 1}
              </span>
              <div>
                <p className="font-bold text-navy text-[16px]">{s.name}</p>
                <p className="mt-1 text-foreground/85 text-[15px] leading-[1.65]">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-7 italic text-navy text-[15px]">
          {ladderLine(c4)}
        </p>
      </div>

      {/* Footer actions */}
      <div className="mt-14 text-[14px] text-navy">
        <button
          onClick={handleCopyShareLink}
          disabled={!sessionId}
          className="hover:underline transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
        >
          {linkCopied ? "Copied" : "Copy share link"}
        </button>
        <span className="text-foreground/40 mx-2">·</span>
        <button
          onClick={() => setSaved(true)}
          className="hover:underline transition-colors duration-150"
        >
          Save my Stack
        </button>
        <span className="text-foreground/40 mx-2">·</span>
        <button
          onClick={handleStartOver}
          className="hover:underline transition-colors duration-150"
        >
          Start over
        </button>
        <span className="text-foreground/40 mx-2">·</span>
        <a href="#tools" className="hover:underline transition-colors duration-150">
          Browse all 17 tools ↓
        </a>
        {saved && (
          <p className="mt-3 italic text-foreground/75 text-[13px]">
            Email save coming next — for now, take a screenshot.
          </p>
        )}
      </div>
    </div>
  );
};



const Q2_OPTIONS = ["Student", "Personal life / family", "Business / work", "Just exploring"];
const Q3_OPTIONS = [
  "Writing something properly",
  "Researching a topic",
  "Building a website or tool",
  "Note-taking and meetings",
  "Generating images or video",
  "Sorting admin or emails",
];
const Q4_OPTIONS = ["Never used it", "Tried it a bit", "Use it weekly", "Pretty confident"];
const Q5_OPTIONS = [
  "Just give me the prompt to copy",
  "Show me a video",
  "I'll read a guide",
  "Walk me through it step by step",
];

// Reverse mappings: DB-stored codes back to the raw question strings used by Result.
const Q2_FROM_CODE: Record<string, string> = {
  student: "Student",
  personal: "Personal life / family",
  business: "Business / work",
  exploring: "Just exploring",
};
const Q3_FROM_CODE: Record<string, string> = {
  writing: "Writing something properly",
  research: "Researching a topic",
  building: "Building a website or tool",
  notes: "Note-taking and meetings",
  images: "Generating images or video",
  admin: "Sorting admin or emails",
};
const Q4_FROM_CODE: Record<string, string> = {
  never: "Never used it",
  tried: "Tried it a bit",
  weekly: "Use it weekly",
  confident: "Pretty confident",
};
const Q5_FROM_CODE: Record<string, string> = {
  prompt: "Just give me the prompt to copy",
  video: "Show me a video",
  guide: "I'll read a guide",
  "step-by-step": "Walk me through it step by step",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type LoadedSession = {
  name: string | null;
  q2_audience: string | null;
  q3_use_case: string | null;
  q3_other_text: string | null;
  q4_confidence: string | null;
  q5_learning_style: string | null;
};

const Stack = () => {
  const { sessionId: routeSessionId } = useParams<{ sessionId?: string }>();
  const sharedMode = !!routeSessionId;

  const [step, setStep] = useState<QuizStep>("intro");
  const [name, setName] = useState("");
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [q3Other, setQ3Other] = useState("");
  const [q3OtherSelected, setQ3OtherSelected] = useState(false);
  const [q4, setQ4] = useState<string | null>(null);
  const [q5, setQ5] = useState<string | null>(null);

  // Shared-load state
  const [sharedLoading, setSharedLoading] = useState<boolean>(sharedMode);
  const [sharedError, setSharedError] = useState<boolean>(false);
  const [sharedSession, setSharedSession] = useState<LoadedSession | null>(null);

  useEffect(() => {
    if (!sharedMode) return;
    if (!routeSessionId || !UUID_RE.test(routeSessionId)) {
      setSharedError(true);
      setSharedLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-session", {
          body: { session_id: routeSessionId },
        });
        if (cancelled) return;
        if (error || !data?.session) {
          setSharedError(true);
        } else {
          setSharedSession(data.session as LoadedSession);
        }
      } catch {
        if (!cancelled) setSharedError(true);
      } finally {
        if (!cancelled) setSharedLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sharedMode, routeSessionId]);

  const reset = () => {
    setStep("intro");
    setName("");
    setQ2(null);
    setQ3(null);
    setQ3Other("");
    setQ3OtherSelected(false);
    setQ4(null);
    setQ5(null);
  };


  const advance = (next: QuizStep) => {
    setTimeout(() => setStep(next), 150);
  };

  const selectQ2 = (v: string) => {
    if (q2 !== v) {
      setQ3(null);
      setQ3Other("");
      setQ3OtherSelected(false);
      setQ4(null);
      setQ5(null);
    }
    setQ2(v);
    advance("q3");
  };
  const selectQ3 = (v: string) => {
    if (q3 !== v) {
      setQ4(null);
      setQ5(null);
    }
    setQ3(v);
    setQ3OtherSelected(false);
    setQ3Other("");
    advance("q4");
  };
  const selectQ3Other = () => {
    setQ3OtherSelected(true);
    setQ3(null);
  };
  const submitQ3Other = () => {
    if (!q3Other.trim()) return;
    setQ3(q3Other.trim());
    setQ4(null);
    setQ5(null);
    advance("q4");
  };
  const selectQ4 = (v: string) => {
    if (q4 !== v) setQ5(null);
    setQ4(v);
    advance("q5");
  };
  const selectQ5 = (v: string) => {
    setQ5(v);
    advance("done");
  };

  const pillBase =
    "inline-flex items-center justify-start text-left rounded-[8px] border border-navy px-4 py-2.5 text-[15px] font-medium transition-colors duration-150";
  const pill = (selected: boolean) =>
    `${pillBase} ${selected ? "bg-navy text-primary-foreground hover:bg-navy/90" : "bg-transparent text-navy hover:bg-navy-light"}`;
  const backLink =
    "text-[13px] text-navy/80 hover:text-navy hover:underline transition-colors duration-150";
  const microcopy = "mt-2 italic text-[14px] text-navy/75";
  const qHeading = "text-[22px] font-bold text-navy";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[760px] px-6 pt-16 pb-24">
        {/* Page header */}
        <header>
          <h1 className="text-[44px] sm:text-[52px] font-bold text-navy tracking-[-0.02em]">
            The Stack
          </h1>
          <p className="mt-4 text-[19px] text-navy/80">
            17 AI tools. Built around how real people actually work.
          </p>
        </header>

        {/* Build My Stack quiz / shared result */}
        <section id="build-my-stack" className="mt-24 mb-24 scroll-mt-20">
          {sharedMode ? (
            <div>
              {sharedLoading && (
                <p className="text-[14px] text-foreground/60 italic">
                  One moment — loading this Stack.
                </p>
              )}
              {!sharedLoading && sharedError && (
                <div>
                  <h2 className="text-[28px] font-bold text-navy">This Stack isn't here.</h2>
                  <p className="mt-3 text-navy/85 text-[17px] leading-[1.7]">
                    Either the link's expired or the URL got mangled in transit.{" "}
                    <Link to="/stack" className="text-navy underline underline-offset-2 hover:opacity-80">
                      Build your own Stack →
                    </Link>
                  </p>
                </div>
              )}
              {!sharedLoading && !sharedError && sharedSession && (
                <>
                  <div className="mb-6 text-[14px]">
                    <Link to="/stack" className="text-navy hover:underline underline-offset-2">
                      Build your own Stack →
                    </Link>
                  </div>
                  <Result
                    name={sharedSession.name ?? ""}
                    q2={Q2_FROM_CODE[sharedSession.q2_audience ?? ""] ?? null}
                    q3={
                      sharedSession.q3_use_case === "other"
                        ? (sharedSession.q3_other_text ?? "Other")
                        : (Q3_FROM_CODE[sharedSession.q3_use_case ?? ""] ?? null)
                    }
                    q4={Q4_FROM_CODE[sharedSession.q4_confidence ?? ""] ?? null}
                    q5={Q5_FROM_CODE[sharedSession.q5_learning_style ?? ""] ?? null}
                    onReset={reset}
                    initialSessionId={routeSessionId}
                    sharedMode
                  />
                </>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-[28px] font-bold text-navy">Build My Stack</h2>
              <p className="mt-3 text-navy/85 text-[17px] leading-[1.7]">
                I'll build your first AI Stack in under two minutes. No jargon. No spam. Just the tools I'd start with if you were sat across from me.
              </p>

              <div className="mt-8 transition-all duration-200">
                {step === "intro" && (
                  <button
                    onClick={() => setStep("q1")}
                    className="inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-3 rounded-[8px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-150"
                  >
                    Start →
                  </button>
                )}

                {step === "q1" && (
                  <div>
                    <h3 className={qHeading}>What should I call you?</h3>
                    <p className={microcopy}>
                      Just a first name. Makes the result feel personal.
                    </p>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah"
                      autoFocus
                      className="mt-5 w-full max-w-[360px] rounded-[8px] border border-navy bg-navy-light px-4 py-3 text-[15px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-navy/30"
                    />
                    <div className="mt-5">
                      <button
                        onClick={() => name.trim() && setStep("q2")}
                        disabled={!name.trim()}
                        className="inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-3 rounded-[8px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-150 disabled:opacity-40 disabled:hover:bg-navy disabled:cursor-not-allowed"
                      >
                        Continue →
                      </button>
                    </div>
                  </div>
                )}

                {step === "q2" && (
                  <div>
                    <h3 className={qHeading}>What are you using AI for first?</h3>
                    <p className={microcopy}>This routes which tools I recommend.</p>
                    <div className="mt-5 flex flex-col items-start gap-2.5">
                      {Q2_OPTIONS.map((o) => (
                        <button key={o} onClick={() => selectQ2(o)} className={pill(q2 === o)}>
                          {o}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6">
                      <button onClick={() => setStep("q1")} className={backLink}>← back</button>
                    </div>
                  </div>
                )}

                {step === "q3" && (
                  <div>
                    <h3 className={qHeading}>What's one thing you want help with this week?</h3>
                    <p className={microcopy}>This makes the recommendation specific.</p>
                    <div className="mt-5 flex flex-col items-start gap-2.5">
                      {Q3_OPTIONS.map((o) => (
                        <button key={o} onClick={() => selectQ3(o)} className={pill(q3 === o && !q3OtherSelected)}>
                          {o}
                        </button>
                      ))}
                      <button onClick={selectQ3Other} className={pill(q3OtherSelected)}>
                        Other
                      </button>
                      {q3OtherSelected && (
                        <div className="mt-2 flex flex-col sm:flex-row gap-2.5 w-full max-w-[480px]">
                          <input
                            type="text"
                            value={q3Other}
                            onChange={(e) => setQ3Other(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") submitQ3Other(); }}
                            placeholder="Tell me what you'd like help with"
                            autoFocus
                            className="flex-1 rounded-[8px] border border-navy bg-navy-light px-4 py-2.5 text-[15px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-navy/30"
                          />
                          <button
                            onClick={submitQ3Other}
                            disabled={!q3Other.trim()}
                            className="inline-flex items-center justify-center bg-navy text-primary-foreground px-4 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-navy/90 transition-colors duration-150 disabled:opacity-40 disabled:hover:bg-navy disabled:cursor-not-allowed"
                          >
                            Continue →
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="mt-6">
                      <button onClick={() => setStep("q2")} className={backLink}>← back</button>
                    </div>
                  </div>
                )}

                {step === "q4" && (
                  <div>
                    <h3 className={qHeading}>How confident are you with AI right now?</h3>
                    <p className={microcopy}>This sets how much I explain.</p>
                    <div className="mt-5 flex flex-col items-start gap-2.5">
                      {Q4_OPTIONS.map((o) => (
                        <button key={o} onClick={() => selectQ4(o)} className={pill(q4 === o)}>
                          {o}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6">
                      <button onClick={() => setStep("q3")} className={backLink}>← back</button>
                    </div>
                  </div>
                )}

                {step === "q5" && (
                  <div>
                    <h3 className={qHeading}>How do you prefer to learn something new?</h3>
                    <p className={microcopy}>This changes the format of your first task.</p>
                    <div className="mt-5 flex flex-col items-start gap-2.5">
                      {Q5_OPTIONS.map((o) => (
                        <button key={o} onClick={() => selectQ5(o)} className={pill(q5 === o)}>
                          {o}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6">
                      <button onClick={() => setStep("q4")} className={backLink}>← back</button>
                    </div>
                  </div>
                )}

                {step === "done" && (
                  <Result name={name} q2={q2} q3={q3} q4={q4} q5={q5} onReset={reset} />
                )}
              </div>
            </>
          )}
        </section>


        {/* The full Stack */}
        <section id="tools" className="mt-16 scroll-mt-20">
          <h2 className="text-[28px] font-bold text-navy">The full Stack</h2>
          <p className="mt-3 text-foreground/85">
            All 17 tools, organised by where they fit in real life.
          </p>

          <div className="mt-10">
            {categories.map((c) => (
              <Category key={c.title} data={c} />
            ))}
          </div>
        </section>

        {/* No-affiliate note */}
        <p className="mt-24 text-center italic text-[14px] text-foreground/70">
          No affiliate links. If I recommend something, it's because I'd tell my own family to use it.
        </p>

        {/* Last updated */}
        <p className="mt-3 text-center text-[12px] text-foreground/50">
          Last updated: May 2026.
        </p>
      </div>
    </SiteLayout>
  );
};

export default Stack;
