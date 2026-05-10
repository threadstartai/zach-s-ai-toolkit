import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { codeQ2, codeQ3, codeQ4, isMeaningfulName } from "@/pages/result/shared/codes";
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

const STEPS: QuizStep[] = ["intro", "q1", "q2", "q3", "q4"];

const Onboarding = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<QuizStep>("q1");
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
      navigate(`/dashboard/stacks/${data.session_id}/my-stack`, { replace: true });
    } catch {
      setSubmitError(true);
      setSubmitting(false);
    }
  };

  const selectQ4 = (v: string) => { setQ4(v); void submitQuiz(v); };

  const stepIndex = STEPS.indexOf(step); // q1=1, q2=2, q3=3, q4=4
  const questionNumber = Math.max(1, stepIndex);
  const segmentCount = 4;

  // Option button styling: default / hover / selected
  const optionBase =
    "w-full text-left p-5 rounded-[12px] bg-background border text-[16px] transition-colors duration-150";
  const optionCls = (selected: boolean) =>
    `${optionBase} ${
      selected
        ? "bg-navy-light/40 border-navy text-navy font-medium"
        : "border-[hsl(var(--border))] text-navy hover:border-navy"
    }`;

  const backLink = "text-[14px] text-foreground/65 hover:text-navy transition-colors duration-150";

  // Per-step heading + subtitle
  const headings: Record<string, { heading: string; subtitle: string }> = {
    q1: { heading: "What should I call you?", subtitle: "Just a first name. Makes the result feel personal." },
    q2: { heading: "What are you using AI for first?", subtitle: "This routes which tools I recommend." },
    q3: { heading: "What's one thing you want help with this week?", subtitle: "This makes the recommendation specific." },
    q4: { heading: "How confident are you with AI right now?", subtitle: "This sets how much I explain." },
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

        {/* Question eyebrow + heading */}
        {current && (
          <div className="mt-8">
            {step === "q1" && (
              <p className="mb-6 italic text-[14px] text-navy/75 leading-relaxed">
                Four quick questions, then your stack. 100% free. Made for friends and family — so nobody gets left behind by AI. The sign-up was just so I can remember you when you come back.
              </p>
            )}
            <p className="text-[12px] uppercase tracking-wider text-navy/60 font-medium">
              Question {questionNumber} of 4
            </p>
            <h1 className="mt-2 text-2xl font-bold text-navy tracking-tight">{current.heading}</h1>
            <p className="mt-2 text-base text-foreground/65">{current.subtitle}</p>
          </div>
        )}

        {/* Step bodies */}
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
                className="w-full h-12 rounded-[12px] border border-[hsl(var(--border))] bg-background px-4 text-[16px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition-shadow duration-150"
              />
              <div className="mt-5">
                <button
                  onClick={() => name.trim() && setStep("q2")}
                  disabled={!name.trim()}
                  className="inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-3 rounded-[10px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
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
                    className="flex-1 h-11 rounded-[10px] border border-[hsl(var(--border))] bg-background px-4 text-[15px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition-shadow duration-150"
                  />
                  <button
                    onClick={submitQ3Other}
                    disabled={!q3Other.trim()}
                    className="inline-flex items-center justify-center bg-navy text-primary-foreground px-4 h-11 rounded-[10px] text-[14px] font-medium hover:bg-navy/90 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "q4" && (
            <div className="flex flex-col gap-3">
              {Q4_OPTIONS.map((o) => (
                <button
                  key={o}
                  onClick={() => selectQ4(o)}
                  disabled={submitting}
                  className={`${optionCls(q4 === o)} ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {o}
                </button>
              ))}
              {submitting && <p className="mt-2 text-[14px] text-foreground/60 italic">One moment — building your Stack.</p>}
              {submitError && <p className="mt-2 text-[14px] text-navy/85">Something went wrong saving that. Please try again.</p>}
            </div>
          )}
        </div>

        {/* Back */}
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
