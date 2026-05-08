import { useState } from "react";
import SiteLayout from "@/components/SiteLayout";

const primaryBtn =
  "inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-3 rounded-[8px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-150";
const outlineBtn =
  "inline-flex items-center justify-center border border-navy text-navy px-5 py-3 rounded-[8px] text-[15px] font-medium hover:bg-navy-light transition-colors duration-150";
const smallOutlineBtn =
  "inline-flex items-center justify-center border border-navy text-navy px-3 py-1.5 rounded-[8px] text-[13px] font-medium hover:bg-navy-light transition-colors duration-150 whitespace-nowrap";
const pillBtn =
  "w-full text-left border border-navy/30 text-foreground px-5 py-4 rounded-[8px] text-[15px] font-medium hover:bg-navy-light hover:border-navy transition-colors duration-150";

type Job = "think" | "research" | "make" | "sort";
type Who = "student" | "personal" | "business" | "exploring";
type Level = "new" | "some" | "comfortable";

type ToolRec = { name: string; why: string; slug: string };

const toolMeta: Record<string, ToolRec> = {
  claude: { name: "Claude", why: "The thinking partner. Where most of your real work will happen.", slug: "claude" },
  "claude-code": { name: "Claude Code", why: "Claude in your terminal — for bigger, multi-file work.", slug: "claude-code" },
  chatgpt: { name: "ChatGPT", why: "The friendliest place to start. Best mobile experience.", slug: "chatgpt" },
  notebooklm: { name: "NotebookLM", why: "Turn lectures, PDFs and notes into something you can actually study from.", slug: "notebooklm" },
  gemini: { name: "Gemini", why: "Plugged into Drive and Gmail. Great for personal research.", slug: "gemini" },
  perplexity: { name: "Perplexity", why: "Cited answers. The research engine you'll use most often.", slug: "perplexity" },
  manus: { name: "Manus", why: "Hands off longer tasks to an agent that actually finishes them.", slug: "manus" },
  lovable: { name: "Lovable", why: "Build a real website by talking to AI. The entry point.", slug: "lovable" },
  higgsfield: { name: "Higgsfield", why: "AI video that doesn't look like AI video.", slug: "higgsfield" },
  base44: { name: "Base44", why: "Build internal tools and small apps without engineering.", slug: "base44" },
  wispr: { name: "Wispr Flow", why: "Voice-to-text that's faster than typing. Use it everywhere.", slug: "wispr-flow" },
  granola: { name: "Granola", why: "Meeting notes that write themselves.", slug: "granola" },
  obsidian: { name: "Obsidian", why: "Your second brain. Local, yours, forever.", slug: "obsidian" },
};

// Order = advancement (last = most advanced, dropped first when over 3)
function recommend(job: Job, who: Who, level: Level): ToolRec[] {
  const picks: string[] = [];
  if (job === "think") {
    picks.push("claude");
    if (level === "new") picks.push("chatgpt");
    if (level === "comfortable") picks.push("claude-code");
  } else if (job === "research") {
    if (who === "student") picks.push("notebooklm");
    if (who === "personal" || who === "exploring") picks.push("gemini");
    if (who === "business" || level === "comfortable") picks.push("perplexity");
    if (level === "comfortable") picks.push("manus");
  } else if (job === "make") {
    picks.push("lovable");
    if ((who === "personal" || who === "business") && level !== "new") picks.push("higgsfield");
    if (level === "comfortable") picks.push("base44");
  } else {
    picks.push("wispr");
    if (who === "business") picks.push("granola");
    if (level === "comfortable") picks.push("obsidian");
  }
  // Dedupe, cap at 3 by dropping most advanced (end of list)
  const unique = Array.from(new Set(picks));
  return unique.slice(0, 3).map((k) => toolMeta[k]);
}

const Quiz = () => {
  const [step, setStep] = useState(0);
  const [job, setJob] = useState<Job | null>(null);
  const [who, setWho] = useState<Who | null>(null);
  const [level, setLevel] = useState<Level | null>(null);

  const reset = () => {
    setStep(0);
    setJob(null);
    setWho(null);
    setLevel(null);
  };

  const q1: { label: string; value: Job }[] = [
    { label: "Think or write", value: "think" },
    { label: "Research or study", value: "research" },
    { label: "Make something (website, content, video, image)", value: "make" },
    { label: "Sort daily life (notes, meetings, voice)", value: "sort" },
  ];
  const q2: { label: string; value: Who }[] = [
    { label: "Student", value: "student" },
    { label: "Personal life / family", value: "personal" },
    { label: "Business / work", value: "business" },
    { label: "Just exploring", value: "exploring" },
  ];
  const q3: { label: string; value: Level }[] = [
    { label: "New to it", value: "new" },
    { label: "Used ChatGPT a bit", value: "some" },
    { label: "Pretty comfortable, want sharper tools", value: "comfortable" },
  ];

  return (
    <div className="mt-8 border border-[hsl(var(--border))]/60 rounded-[12px] p-6 md:p-8">
      {step === 0 && (
        <div>
          <p className="text-foreground font-semibold mb-5">What's the job tonight?</p>
          <div className="grid gap-3">
            {q1.map((o) => (
              <button
                key={o.value}
                className={pillBtn}
                onClick={() => {
                  setJob(o.value);
                  setStep(1);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 1 && (
        <div>
          <p className="text-foreground font-semibold mb-5">Who's this for?</p>
          <div className="grid gap-3">
            {q2.map((o) => (
              <button
                key={o.value}
                className={pillBtn}
                onClick={() => {
                  setWho(o.value);
                  setStep(2);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <p className="text-foreground font-semibold mb-5">Where are you on AI right now?</p>
          <div className="grid gap-3">
            {q3.map((o) => (
              <button
                key={o.value}
                className={pillBtn}
                onClick={() => {
                  setLevel(o.value);
                  setStep(3);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 3 && job && who && level && (
        <div>
          <h3 className="text-2xl font-bold text-navy">Start with this.</h3>
          <div className="mt-6 space-y-5">
            {recommend(job, who, level).map((t) => (
              <div
                key={t.slug}
                className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-t border-[hsl(var(--border))]/50 pt-5"
              >
                <div className="flex-1">
                  <p className="font-bold text-navy text-[17px]">{t.name}</p>
                  <p className="text-foreground/80 text-[15px] mt-1">{t.why}</p>
                </div>
                <a href={`/pdfs/${t.slug}.pdf`} className={primaryBtn}>
                  Read the guide →
                </a>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-6">
            <a href="#tools" className="text-navy text-[14px] hover:underline">
              Or browse the full Stack below ↓
            </a>
            <button onClick={reset} className="text-foreground/60 text-[14px] hover:text-navy transition-colors">
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

type Tool = { num?: string; name: string; tagline: string; slug: string };

const foundationals: Tool[] = [
  { num: "00", name: "Start Here", tagline: "Where to begin and what order to read.", slug: "00-start-here" },
  { num: "01", name: "Why I Made This", tagline: "The honest reason this exists.", slug: "01-why-i-made-this" },
  { num: "02", name: "The Process", tagline: "The four-step loop I use for almost everything.", slug: "02-the-process" },
  { num: "03", name: "How This Was Built", tagline: "Behind the scenes.", slug: "03-how-this-was-built" },
  { name: "The Master Prompt Guide", tagline: "The prompt patterns worth memorising.", slug: "master-prompt-guide" },
  { name: "Power-Ups", tagline: "Small upgrades that make a big difference.", slug: "power-ups" },
  { name: "Pass This On", tagline: "Who this is for, and how to share it.", slug: "pass-this-on" },
];

const thinking: Tool[] = [
  { num: "01", name: "Claude", tagline: "The thinking partner. Start here.", slug: "claude" },
  { num: "02", name: "Claude Code", tagline: "Claude in your terminal. For bigger work.", slug: "claude-code" },
  { num: "03", name: "Co-Pilot", tagline: "Claude inside Excel, Word, PowerPoint.", slug: "co-pilot" },
  { num: "04", name: "ChatGPT", tagline: "The all-rounder. Best mobile experience.", slug: "chatgpt" },
  { num: "05", name: "Grok", tagline: "When timing matters. Live news, real-time data.", slug: "grok" },
];

const research: Tool[] = [
  { num: "06", name: "Gemini", tagline: "Google's research assistant. Connected to Drive and Workspace.", slug: "gemini" },
  { num: "07", name: "Perplexity", tagline: "The research engine. Cited answers.", slug: "perplexity" },
  { num: "08", name: "Manus", tagline: "The connected work agent. For longer tasks.", slug: "manus" },
  { num: "09", name: "NotebookLM", tagline: "Turn any source into notes, audio, mind maps.", slug: "notebooklm" },
];

const building: Tool[] = [
  { name: "Building Things — Overview", tagline: "The whole landscape, in one place.", slug: "building-things-overview" },
  { num: "10", name: "Lovable", tagline: "Build a website by talking to AI.", slug: "lovable" },
  { num: "11", name: "Base44", tagline: "Build internal tools and apps.", slug: "base44" },
  { num: "12", name: "Higgsfield", tagline: "AI video that's actually good.", slug: "higgsfield" },
  { num: "13", name: "Artlist", tagline: "Music, sound, footage for anything you make.", slug: "artlist" },
  { num: "14", name: "Nano Banana & Veo", tagline: "Image and video generation, the current best.", slug: "nano-banana-veo" },
];

const daily: Tool[] = [
  { num: "15", name: "Wispr Flow", tagline: "Voice-to-text. Faster than typing.", slug: "wispr-flow" },
  { num: "16", name: "Granola", tagline: "Meeting notes that write themselves.", slug: "granola" },
  { num: "17", name: "Obsidian", tagline: "Your second brain. Local, yours, forever.", slug: "obsidian" },
];

const ToolRow = ({ tool }: { tool: Tool }) => (
  <a
    href={`/pdfs/${tool.slug}.pdf`}
    className="group flex items-center gap-5 -mx-3 px-3 py-4 rounded-[8px] hover:bg-navy-light transition-colors duration-150"
  >
    <div className="flex items-baseline gap-3 min-w-[180px] sm:min-w-[220px] shrink-0">
      {tool.num && (
        <span className="text-navy font-mono text-[13px] tabular-nums">{tool.num}</span>
      )}
      <span className="text-navy font-bold text-[16px]">{tool.name}</span>
    </div>
    <p className="hidden sm:block flex-1 text-foreground/80 text-[15px]">{tool.tagline}</p>
    <span className={smallOutlineBtn}>Download PDF</span>
  </a>
);

const Category = ({
  title,
  description,
  tools,
}: {
  title: string;
  description: string;
  tools: Tool[];
}) => (
  <section className="mt-16 md:mt-20">
    <h3 className="text-2xl md:text-3xl font-bold text-navy">{title}</h3>
    <p className="mt-3 text-foreground/80 text-[16px]">{description}</p>
    <div className="mt-6 divide-y divide-[hsl(var(--border))]/40">
      {tools.map((t) => (
        <ToolRow key={t.slug} tool={t} />
      ))}
    </div>
    <div className="sm:hidden mt-4 space-y-3 text-[14px] text-foreground/70">
      {tools.map((t) => (
        <p key={t.slug}>
          <span className="font-semibold text-navy">{t.name}:</span> {t.tagline}
        </p>
      ))}
    </div>
  </section>
);

const Stack = () => {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-[760px] px-6">
        {/* Header */}
        <section className="pt-24 pb-12 md:pt-32">
          <h1 className="text-5xl md:text-6xl font-extrabold text-navy tracking-[-0.02em]">
            The Stack
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-navy leading-snug">
            17 AI tools, written like a friend would explain them.
          </p>
        </section>

        {/* Start Here block */}
        <section id="start-here" className="scroll-mt-24">
          <div className="bg-navy-light rounded-[12px] p-8 md:p-10">
            <h2 className="text-xl md:text-2xl font-bold text-navy">
              First time here?
            </h2>
            <p className="mt-4 text-foreground/90 text-[17px] leading-[1.7]">
              Read 00 — Start Here. It's 8 pages. It tells you exactly what
              order to read the rest in, and what to skip if you don't have
              time.
            </p>
            <div className="mt-6">
              <a href="/pdfs/00-start-here.pdf" className={primaryBtn}>
                Read Start Here →
              </a>
            </div>
          </div>
        </section>

        {/* Find My Path quiz */}
        <section id="find-my-path" className="scroll-mt-24 mt-24">
          <h2 className="text-3xl md:text-4xl">Not sure where to start?</h2>
          <p className="mt-5 text-foreground/90 text-[17px] leading-[1.7]">
            Three quick questions. Then one or two tools to try tonight.
          </p>
          <FindMyPath />
        </section>

        {/* The full Stack */}
        <section id="tools" className="scroll-mt-24 mt-28">
          <h2 className="text-3xl md:text-4xl">The full Stack</h2>

          <Category
            title="Foundationals"
            description="The seven docs that make the rest of the Stack make sense."
            tools={foundationals}
          />
          <Category
            title="Thinking & Writing"
            description="Tools that help you think clearly and write better."
            tools={thinking}
          />
          <Category
            title="Research & Study"
            description="Tools for going deep on a topic."
            tools={research}
          />
          <Category
            title="Building Things"
            description="Tools for making websites, apps, content, video, and images."
            tools={building}
          />
          <Category
            title="Daily Life"
            description="Tools that fit into how you already work."
            tools={daily}
          />
        </section>

        {/* No-affiliate note */}
        <section className="mt-28">
          <p className="italic text-center text-foreground/70 text-[15px] leading-[1.7]">
            No affiliate links. If I recommend something, it's because I'd tell
            my own family to use it.
          </p>
          <p className="mt-4 text-center text-[12px] text-foreground/50">
            Last updated: May 2026.
          </p>
        </section>
      </article>
    </SiteLayout>
  );
};

const FindMyPath = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {!open && (
        <div className="mt-8">
          <button onClick={() => setOpen(true)} className={primaryBtn}>
            Find my path →
          </button>
        </div>
      )}
      <div
        className="overflow-hidden transition-[max-height] duration-200 ease-out"
        style={{ maxHeight: open ? 2000 : 0 }}
      >
        {open && <Quiz />}
      </div>
    </div>
  );
};

export default Stack;
