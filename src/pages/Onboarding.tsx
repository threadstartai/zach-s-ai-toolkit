import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  codeQ2, codeQ3, codeQ4, isMeaningfulName,
  codeRole, codeTimeBudget, codeExistingTool,
} from "@/pages/result/shared/codes";
import type { QuizStep } from "@/pages/result/shared/types";

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

const ROLE_OPTIONS = [
  "Founder / CEO",
  "Solo / freelance",
  "Team lead or manager",
  "Individual contributor",
  "Student",
  "Personal life / family",
  "Retired or exploring",
];
const TIME_OPTIONS = [
  "About 15 minutes a week",
  "About 30 minutes a week",
  "About 1 hour a week",
  "Several hours a week",
  "Open-ended — I'll go as deep as it's worth",
];
const TOOL_OPTIONS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "GitHub Copilot",
  "Perplexity",
  "Other AI tool",
  "Nothing yet",
];

const STEPS: QuizStep[] = ["intro", "q1", "q2", "role", "q3", "tools", "q4", "time"];

const Onboarding = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<QuizStep>("q1");
  const [name, setName] = useState("");
  const [q2, setQ2] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [q3Other, setQ3Other] = useState("");
  const [q3OtherSelected, setQ3OtherSelected] = useState(false);
  const [tools, setTools] = useState<string[]>([]);
  const [q4, setQ4] = useState<string | null>(null);
  const [timeBudget, setTimeBudget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const submittingRef = useRef(false);

  const advance = (next: QuizStep) => setTimeout(() => setStep(next), 150);

  const selectQ2 = (v: string) => { setQ2(v); advance("role"); };
  const selectRole = (v: string) => { setRole(v); advance("q3"); };
  const selectQ3 = (v: string) => {
    setQ3(v); setQ3OtherSelected(false); setQ3Other(""); advance("tools");
  };
  const selectQ3Other = () => { setQ3OtherSelected(true); setQ3(null); };
  const submitQ3Other = () => {
    if (!q3Other.trim()) return;
    setQ3(q3Other.trim()); advance("tools");
  };

  const toggleTool = (v: string) => {
    setTools((prev) => {
      if (v === "Nothing yet") return prev.includes("Nothing yet") ? [] : ["Nothing yet"];
      const without = prev.filter((t) => t !== "Nothing yet");
      return without.includes(v) ? without.filter((t) => t !== v) : [...without, v];
    });
  };
  const submitTools = () => { if (tools.length > 0) advance("q4"); };

  const selectQ4 = (v: string) => { setQ4(v); advance("time"); };

  const submitQuiz = async (timeValue: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(false);
    const c2 = codeQ2(q2);
    const c3 = codeQ3(q3);
    const c4 = codeQ4(q4);
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
          onboarding_role: codeRole(role),
          onboarding_time_budget: codeTimeBudget(timeValue),
          onboarding_existing_tools: tools.map(codeExistingTool),
        },
      });
      if (error || !data?.session_id) {
        setSubmitError(true);
        setSubmitting(false);
        submittingRef.current = false;
        return;
      }
      navigate(`/dashboard/stacks/${data.session_id}/my-stack`, { replace: true });
    } catch {
      setSubmitError(true);
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  const selectTime = (v: string) => { setTimeBudget(v); void submitQuiz(v); };

  const stepIndex = STEPS.indexOf(step);
  const questionNumber = Math.max(1, stepIndex);
  const segmentCount = 7;

  const optionBase =
    "w-full text-left p-5 rounded-[12px] bg-background border text-[16px] break-words transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";
  const optionCls = (selected: boolean) =>
    `${optionBase} ${
      selected
        ? "bg-navy-light/40 border-navy text-navy font-medium"
        : "border-[hsl(var(--border))] text-navy hover:border-navy"
    }`;

  const backLink = "text-[14px] text-foreground/65 hover:text-navy transition-colors duration-200 ease-out";

  const headings: Record<string, { heading: string; subtitle: string }> = {
    q1: { heading: "What should I call you?", subtitle: "Just a first name. Makes the result feel personal." },
    q2: { heading: "What are you using AI for first?", subtitle: "This routes which tools I recommend." },
    role: { heading: "What's your role or situation?", subtitle: "Helps me think about who's getting AI advice — you, your team, or no one in particular." },
    q3: { heading: "What's one thing you want help with this week?", subtitle: "This makes the recommendation specific." },
    tools: { heading: "What are you already using?", subtitle: "I'll deprioritise tools you've already got — unless they're the best fit anyway." },
    q4: { heading: "How confident are you with AI right now?", subtitle: "This sets how much I explain." },
    time: { heading: "How much time can you give this?", subtitle: "I'll match recommendations to what's realistic — not what sounds good." },
  };
  const current = headings[step as keyof typeof headings];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-5">
      <Link to="/" className="font-bold text-navy text-lg mt-12 mb-8">
        My AI Stack
      </Link>

      <div className="w-full max-w-[600px] bg-background rounded-[16px] border border-[hsl(var(--border))] shadow-[0_2px_12px_rgba(26,58,92,0.06)] p-10 md:p-12 mb-12">
        {/* Progress segments */}
        <div className="flex gap-2">
          {Array.from({ length: segmentCount }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                i < questionNumber ? "bg-navy" : "bg-navy-light"
              }`}
            />
          ))}
        </div>

        {current && (
          <div className="mt-8">
            {step === "q1" && (
              <p className="mb-6 italic text-[14px] text-navy/75 leading-relaxed">
                Seven quick steps, then your stack. 100% free. Made for friends and family — so nobody gets left behind by AI. The sign-up was just so I can remember you when you come back.
              </p>
            )}
            <p className="text-[12px] uppercase tracking-wider text-navy/60 font-medium">
              Step {questionNumber} of {segmentCount}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-navy tracking-tight">{current.heading}</h1>
            <p className="mt-2 text-base text-foreground/65">{current.subtitle}</p>
          </div>
        )}

        <div className="mt-8">
          {step === "q1" && (
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) setStep("q2"); }}
                placeholder="e.g. Sarah"
                autoFocus
                className="w-full h-12 rounded-[12px] border border-[hsl(var(--border))] bg-background px-4 text-[16px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition-shadow duration-200 ease-out"
              />
              <div className="mt-5">
                <button
                  onClick={() => name.trim() && setStep("q2")}
                  disabled={!name.trim()}
                  className="inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-3 rounded-[10px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === "q2" && (
            <div className="flex flex-col gap-3">
              {Q2_OPTIONS.map((o) => (
                <button key={o} onClick={() => selectQ2(o)} className={optionCls(q2 === o)}>{o}</button>
              ))}
            </div>
          )}

          {step === "role" && (
            <div className="flex flex-col gap-3">
              {ROLE_OPTIONS.map((o) => (
                <button key={o} onClick={() => selectRole(o)} className={optionCls(role === o)}>{o}</button>
              ))}
            </div>
          )}

          {step === "q3" && (
            <div className="flex flex-col gap-3">
              {Q3_OPTIONS.map((o) => (
                <button key={o} onClick={() => selectQ3(o)} className={optionCls(q3 === o && !q3OtherSelected)}>{o}</button>
              ))}
              <button onClick={selectQ3Other} className={optionCls(q3OtherSelected)}>Other</button>
              {q3OtherSelected && (
                <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                  <input
                    type="text"
                    value={q3Other}
                    onChange={(e) => setQ3Other(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submitQ3Other(); }}
                    placeholder="Tell me what you'd like help with"
                    autoFocus
                    className="flex-1 h-11 rounded-[10px] border border-[hsl(var(--border))] bg-background px-4 text-[15px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition-shadow duration-200 ease-out"
                  />
                  <button
                    onClick={submitQ3Other}
                    disabled={!q3Other.trim()}
                    className="inline-flex items-center justify-center bg-navy text-primary-foreground px-4 h-11 rounded-[10px] text-[14px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "tools" && (
            <div className="flex flex-col gap-3">
              {TOOL_OPTIONS.map((o) => (
                <button key={o} onClick={() => toggleTool(o)} className={optionCls(tools.includes(o))}>{o}</button>
              ))}
              <div className="mt-3">
                <button
                  onClick={submitTools}
                  disabled={tools.length === 0}
                  className="inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-3 rounded-[10px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === "q4" && (
            <div className="flex flex-col gap-3">
              {Q4_OPTIONS.map((o) => (
                <button key={o} onClick={() => selectQ4(o)} className={optionCls(q4 === o)}>{o}</button>
              ))}
            </div>
          )}

          {step === "time" && (
            <div className="flex flex-col gap-3">
              {TIME_OPTIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => selectTime(o)}
                  disabled={submitting}
                  className={`${optionCls(timeBudget === o)} ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {o}
                </button>
              ))}
              {submitting && <p className="mt-2 text-[14px] text-foreground/60 italic">One moment — building your Stack.</p>}
              {submitError && <p className="mt-2 text-[14px] text-navy/85">Something went wrong saving that. Please try again.</p>}
            </div>
          )}
        </div>

        {questionNumber > 1 && (
          <div className="mt-8">
            <button
              onClick={() => {
                const prev = STEPS[stepIndex - 1];
                if (prev) setStep(prev);
              }}
              className={backLink}
            >
              ← back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
