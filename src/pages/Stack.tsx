import { useState } from "react";
import SiteLayout from "@/components/SiteLayout";

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
    <a
      href={`/pdfs/${tool.slug}.pdf`}
      className="inline-flex items-center justify-center self-start sm:self-auto rounded-[8px] border border-navy text-navy px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 hover:bg-navy-light shrink-0"
    >
      Download PDF
    </a>
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

const Stack = () => {
  const [step, setStep] = useState<QuizStep>("intro");
  const [name, setName] = useState("");
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [q3Other, setQ3Other] = useState("");
  const [q3OtherSelected, setQ3OtherSelected] = useState(false);
  const [q4, setQ4] = useState<string | null>(null);
  const [q5, setQ5] = useState<string | null>(null);

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

        {/* Build My Stack quiz */}
        <section className="mt-24 mb-24">
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
              <div>
                <h3 className={qHeading}>Hi {name.trim()}.</h3>
                <ul className="mt-5 space-y-2 text-foreground/85 text-[16px] leading-[1.7]">
                  <li><span className="text-navy font-semibold">Using AI for:</span> {q2}</li>
                  <li><span className="text-navy font-semibold">This week:</span> {q3}</li>
                  <li><span className="text-navy font-semibold">Confidence:</span> {q4}</li>
                  <li><span className="text-navy font-semibold">Learning style:</span> {q5}</li>
                </ul>
                <p className="mt-5 italic text-foreground/70 text-[14px]">
                  Placeholder — the real result page lands next.
                </p>
                <button
                  onClick={reset}
                  className="mt-5 text-[14px] text-navy hover:underline"
                >
                  Start over
                </button>
              </div>
            )}
          </div>
        </section>


        {/* The full Stack */}
        <section className="mt-16">
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
