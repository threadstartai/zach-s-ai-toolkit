import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import { Card } from "@/components/ui-primitives/Card";
import { supabase } from "@/integrations/supabase/client";
import { codeQ2, codeQ3, codeQ4, isMeaningfulName } from "@/pages/result/shared/codes";
import type { QuizStep } from "@/pages/result/shared/types";

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

const ToolCard = ({ tool }: { tool: Tool }) => (
  <Card hoverable className="h-full">
    <div className="flex items-baseline gap-3">
      {tool.num && <span className="font-mono text-[12px] text-navy/55">{tool.num}</span>}
      <h4 className="text-[17px] font-bold text-navy">{tool.name}</h4>
    </div>
    <p className="mt-2 text-[14.5px] leading-[1.6] text-foreground/80">{tool.tagline}</p>
  </Card>
);

const CategorySection = ({ data }: { data: CategoryData }) => (
  <section className="mt-14 first:mt-0 scroll-mt-20">
    <h3 className="text-[22px] font-bold text-navy">{data.title}</h3>
    <p className="mt-2 italic text-[14px] text-foreground/70">{data.blurb}</p>
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
    </div>
  </section>
);

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

const Stack = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<QuizStep>("intro");
  const [name, setName] = useState("");
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [q3Other, setQ3Other] = useState("");
  const [q3OtherSelected, setQ3OtherSelected] = useState(false);
  const [q4, setQ4] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const advance = (next: QuizStep) => setTimeout(() => setStep(next), 150);

  const selectQ2 = (v: string) => {
    if (q2 !== v) { setQ3(null); setQ3Other(""); setQ3OtherSelected(false); setQ4(null); }
    setQ2(v); advance("q3");
  };
  const selectQ3 = (v: string) => {
    if (q3 !== v) setQ4(null);
    setQ3(v); setQ3OtherSelected(false); setQ3Other(""); advance("q4");
  };
  const selectQ3Other = () => { setQ3OtherSelected(true); setQ3(null); };
  const submitQ3Other = () => {
    if (!q3Other.trim()) return;
    setQ3(q3Other.trim()); setQ4(null); advance("q4");
  };

  const submitQuiz = async (q4Value: string) => {
    setSubmitting(true);
    setSubmitError(false);
    const c2 = codeQ2(q2);
    const c3 = codeQ3(q3);
    const c4 = codeQ4(q4Value);
    const displayName = isMeaningfulName(name) ? name.trim() : null;
    try {
      const { data, error } = await supabase.functions.invoke("submit-quiz", {
        body: {
          name: displayName ?? "Anonymous",
          q2_audience: c2,
          q3_use_case: c3,
          q3_other_text: c3 === "other" ? (q3 ?? "") : "",
          q4_confidence: c4,
          q5_learning_style: null,
        },
      });
      if (error || !data?.session_id) {
        setSubmitError(true);
        setSubmitting(false);
        return;
      }
      navigate(`/stack/result/${data.session_id}/my-stack`);
    } catch {
      setSubmitError(true);
      setSubmitting(false);
    }
  };

  const selectQ4 = (v: string) => { setQ4(v); void submitQuiz(v); };

  const pillBase =
    "inline-flex items-center justify-start text-left rounded-[8px] border border-navy px-4 py-2.5 text-[15px] font-medium transition-colors duration-150";
  const pill = (selected: boolean) =>
    `${pillBase} ${selected ? "bg-navy text-primary-foreground hover:bg-navy/90" : "bg-transparent text-navy hover:bg-navy-light"}`;
  const backLink = "text-[13px] text-navy/80 hover:text-navy hover:underline transition-colors duration-150";
  const microcopy = "mt-2 italic text-[14px] text-navy/75";
  const qHeading = "text-[20px] font-bold text-navy";

  const quizActive = step !== "intro";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1100px] px-6 pt-12 md:pt-16 pb-24">
        {/* Hero */}
        <header className="max-w-[760px]">
          <h1 className="text-[44px] sm:text-[52px] font-extrabold text-navy tracking-[-0.02em] leading-[1.05]">
            The Stack
          </h1>
          <p className="mt-4 text-[18px] text-navy/85 leading-snug">
            All 17 tools, organised by where they fit in real life.
          </p>
          <p className="mt-3 italic text-[14px] text-navy/65">
            No affiliate links. If I recommend something, it's because I'd tell my own family to use it.
          </p>
        </header>

        {/* Build My Stack — banner / panel */}
        <section id="build-my-stack" className="mt-10 scroll-mt-20">
          {!quizActive ? (
            <Card className="bg-navy-light/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-bold text-navy">Build my Stack</h2>
                <p className="mt-1 text-[14.5px] text-navy/80">
                  Four quick questions. I'll narrow this down to three tools, just for you.
                </p>
              </div>
              <button
                onClick={() => setStep("q1")}
                className="self-start sm:self-center inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-navy/90 transition-colors duration-150"
              >
                Start →
              </button>
            </Card>
          ) : (
            <Card className="bg-background">
              {step === "q1" && (
                <div>
                  <h3 className={qHeading}>What should I call you?</h3>
                  <p className={microcopy}>Just a first name. Makes the result feel personal.</p>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah"
                    autoFocus
                    className="mt-5 w-full max-w-[360px] rounded-[8px] border border-[hsl(var(--border))] bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
                  />
                  <div className="mt-5 flex items-center gap-4">
                    <button
                      onClick={() => name.trim() && setStep("q2")}
                      disabled={!name.trim()}
                      className="inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-navy/90 transition-colors duration-150 disabled:opacity-40 disabled:hover:bg-navy disabled:cursor-not-allowed"
                    >
                      Continue →
                    </button>
                    <button onClick={() => setStep("intro")} className={backLink}>cancel</button>
                  </div>
                </div>
              )}

              {step === "q2" && (
                <div>
                  <h3 className={qHeading}>What are you using AI for first?</h3>
                  <p className={microcopy}>This routes which tools I recommend.</p>
                  <div className="mt-5 flex flex-col items-start gap-2.5">
                    {Q2_OPTIONS.map((o) => (
                      <button key={o} onClick={() => selectQ2(o)} className={pill(q2 === o)}>{o}</button>
                    ))}
                  </div>
                  <div className="mt-5"><button onClick={() => setStep("q1")} className={backLink}>← back</button></div>
                </div>
              )}

              {step === "q3" && (
                <div>
                  <h3 className={qHeading}>What's one thing you want help with this week?</h3>
                  <p className={microcopy}>This makes the recommendation specific.</p>
                  <div className="mt-5 flex flex-col items-start gap-2.5">
                    {Q3_OPTIONS.map((o) => (
                      <button key={o} onClick={() => selectQ3(o)} className={pill(q3 === o && !q3OtherSelected)}>{o}</button>
                    ))}
                    <button onClick={selectQ3Other} className={pill(q3OtherSelected)}>Other</button>
                    {q3OtherSelected && (
                      <div className="mt-2 flex flex-col sm:flex-row gap-2.5 w-full max-w-[480px]">
                        <input
                          type="text"
                          value={q3Other}
                          onChange={(e) => setQ3Other(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") submitQ3Other(); }}
                          placeholder="Tell me what you'd like help with"
                          autoFocus
                          className="flex-1 rounded-[8px] border border-[hsl(var(--border))] bg-background px-4 py-2.5 text-[15px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy"
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
                  <div className="mt-5"><button onClick={() => setStep("q2")} className={backLink}>← back</button></div>
                </div>
              )}

              {step === "q4" && (
                <div>
                  <h3 className={qHeading}>How confident are you with AI right now?</h3>
                  <p className={microcopy}>This sets how much I explain.</p>
                  <div className="mt-5 flex flex-col items-start gap-2.5">
                    {Q4_OPTIONS.map((o) => (
                      <button
                        key={o}
                        onClick={() => selectQ4(o)}
                        disabled={submitting}
                        className={`${pill(q4 === o)} ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                  {submitting && <p className="mt-5 text-[14px] text-foreground/60 italic">One moment — building your Stack.</p>}
                  {submitError && <p className="mt-5 text-[14px] text-navy/85">Something went wrong saving that. Please try again.</p>}
                  <div className="mt-5"><button onClick={() => setStep("q3")} className={backLink}>← back</button></div>
                </div>
              )}
            </Card>
          )}
        </section>

        {/* Categories */}
        <section id="tools" className="mt-16 scroll-mt-20">
          {categories.map((c) => <CategorySection key={c.title} data={c} />)}
        </section>

        <p className="mt-20 text-[12px] text-center text-foreground/55">
          Last updated: May 2026.
        </p>

        {/* Hidden link target preserved for old Index linkout */}
        <span id="start-here" className="sr-only" />
        <span id="process" className="sr-only" />
      </div>
    </SiteLayout>
  );
};

export default Stack;
