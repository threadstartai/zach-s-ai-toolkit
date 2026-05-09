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

type QuizStep = "intro" | "q1" | "done";

const Stack = () => {
  const [step, setStep] = useState<QuizStep>("intro");
  const [name, setName] = useState("");

  const reset = () => {
    setStep("intro");
    setName("");
  };

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
                <h3 className="text-[22px] font-bold text-navy">What should I call you?</h3>
                <p className="mt-2 italic text-[14px] text-navy/75">
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
                    onClick={() => name.trim() && setStep("done")}
                    disabled={!name.trim()}
                    className="inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-3 rounded-[8px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-150 disabled:opacity-40 disabled:hover:bg-navy disabled:cursor-not-allowed"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {step === "done" && (
              <div>
                <h3 className="text-[22px] font-bold text-navy">Hi {name.trim()}.</h3>
                <p className="mt-3 text-foreground/85 text-[17px] leading-[1.7]">
                  This is a placeholder. The rest of the quiz will land here in the next step.
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
