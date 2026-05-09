import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { codeQ2, codeQ3, codeQ4, isMeaningfulName } from "@/pages/result/shared/codes";
import type { QuizStep } from "@/pages/result/shared/types";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";

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

  const pillBase =
    "inline-flex items-center justify-start text-left rounded-[8px] border border-navy px-4 py-2.5 text-[15px] font-medium transition-colors duration-150";
  const pill = (selected: boolean) =>
    `${pillBase} ${selected ? "bg-navy text-primary-foreground hover:bg-navy/90" : "bg-transparent text-navy hover:bg-navy-light"}`;
  const backLink = "text-[13px] text-navy/80 hover:text-navy hover:underline transition-colors duration-150";
  const microcopy = "mt-2 italic text-[14px] text-navy/75";
  const qHeading = "text-[22px] font-bold text-navy";

  const stepIndex = STEPS.indexOf(step);
  const progress = Math.max(0, Math.min(1, (stepIndex - 1) / (STEPS.length - 2))) * 100;

  const segmentCount = 4; // q1..q4
  const segmentIndex = Math.max(0, stepIndex - 1); // 0..3

  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      <DashboardTopBar />
      <main className="flex-1 px-5 py-10 sm:py-14">
        <div className="mx-auto max-w-[560px]">
          {/* Segmented progress */}
          <div className="flex gap-1.5">
            {Array.from({ length: segmentCount }).map((_, i) => (
              <div
                key={i}
                className={`h-[3px] flex-1 rounded-full transition-colors duration-200 ${
                  i <= segmentIndex ? "bg-navy" : "bg-[hsl(var(--border))]"
                }`}
              />
            ))}
          </div>

          <header className="mt-6">
            <p className="text-[12px] uppercase tracking-wider text-navy/60 font-medium">Onboarding</p>
            <h1 className="mt-2 text-[24px] font-bold text-navy tracking-tight">
              Let me build your first Stack.
            </h1>
            <p className="mt-2 text-navy/75 text-[15px] leading-[1.6]">
              Four quick questions. Under two minutes.
            </p>
          </header>

          <section className="mt-7 bg-background border border-[hsl(var(--border))] rounded-[16px] p-8 sm:p-10 shadow-[0_2px_8px_rgba(26,58,92,0.06)]">
            {step === "q1" && (
              <div>
                <h2 className={qHeading}>What should I call you?</h2>
                <p className={microcopy}>Just a first name. Makes the result feel personal.</p>
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
                <h2 className={qHeading}>What are you using AI for first?</h2>
                <p className={microcopy}>This routes which tools I recommend.</p>
                <div className="mt-5 flex flex-col items-start gap-2.5">
                  {Q2_OPTIONS.map((o) => (
                    <button key={o} onClick={() => selectQ2(o)} className={pill(q2 === o)}>{o}</button>
                  ))}
                </div>
                <div className="mt-6"><button onClick={() => setStep("q1")} className={backLink}>← back</button></div>
              </div>
            )}

            {step === "q3" && (
              <div>
                <h2 className={qHeading}>What's one thing you want help with this week?</h2>
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
                <div className="mt-6"><button onClick={() => setStep("q2")} className={backLink}>← back</button></div>
              </div>
            )}

            {step === "q4" && (
              <div>
                <h2 className={qHeading}>How confident are you with AI right now?</h2>
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
                <div className="mt-6"><button onClick={() => setStep("q3")} className={backLink}>← back</button></div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
