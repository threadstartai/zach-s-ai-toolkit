import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useResultContext } from "../shared/useResultContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { TOOLS, whyFor, whyForChatGPT } from "../shared/tools";
import { audiencePhrase, useCasePhrase, confidencePhrase, whyThisTool, rolePhrase, timeBudgetPhrase } from "../shared/phrases";
import { SECTION_LABELS, LADDER, groupChunks } from "../shared/chunks";
import { ChunkBlock } from "../shared/ChunkBlock";
import { SaveChunkButton } from "../shared/SaveChunkButton";
import type { Chunk, ToolKey } from "../shared/types";
import { fullGuideUrl } from "@/lib/pdfs";
import { ToolDetailDrawer } from "../ToolDetailDrawer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { ChunkFeedbackButton } from "../shared/ChunkFeedbackButton";

const MyStack = () => {
  const {
    title, picks, c2, c3, c4, q3OtherText, q3,
    chunksByTool, statusByTool, toolStatusMap, showSlowMessage,
    feedbackOpen, feedbackSubmitted, setFeedbackOpen, submitFeedback,
    sessionId, linkCopied, handleCopyShareLink, handleStartOver,
    savedChunkIds, toggleSave,
    aiPickReasoning,
    isDashboard,
    stackLabel,
    onboardingRole,
    onboardingTimeBudget,
  } = useResultContext();
  const { user } = useAuth();
  const [renaming, setRenaming] = useState(false);
  const [labelDraft, setLabelDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [detailSlug, setDetailSlug] = useState<string | null>(null);

  const modeKey = sessionId ? `myaistack_mode_${sessionId}` : null;
  const indexKey = sessionId ? `myaistack_idx_${sessionId}` : null;

  const [mode, setMode] = useState<"everything" | "guided">(() => {
    if (typeof window === "undefined" || !modeKey) return "everything";
    return (localStorage.getItem(modeKey) as "everything" | "guided") || "everything";
  });
  const [guidedIndex, setGuidedIndex] = useState<number>(() => {
    if (typeof window === "undefined" || !indexKey) return 0;
    const raw = localStorage.getItem(indexKey);
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
  });
  useEffect(() => { if (modeKey) localStorage.setItem(modeKey, mode); }, [mode, modeKey]);
  useEffect(() => { if (indexKey) localStorage.setItem(indexKey, String(guidedIndex)); }, [guidedIndex, indexKey]);

  const guidedSteps = useMemo(() => {
    const steps: { toolKey: ToolKey; sectionKey: string; sectionLabel: string; chunk: Chunk }[] = [];
    for (const k of picks) {
      const t = TOOLS[k];
      const grouped = groupChunks(chunksByTool[t.slug] ?? []);
      for (const s of SECTION_LABELS) {
        const items = grouped[s.key];
        if (!items) continue;
        for (const ch of items) {
          steps.push({ toolKey: k, sectionKey: s.key, sectionLabel: s.label, chunk: ch });
        }
      }
    }
    return steps;
  }, [picks, chunksByTool]);

  const stageFromConfidence = (() => {
    switch (c4) {
      case "tried": return 2;
      case "weekly": return 3;
      case "confident": return 4;
      default: return 1;
    }
  })();

  const why = (k: ToolKey) => k === "04" ? whyForChatGPT(c4) : whyFor(k, c2);

  const [showWelcome, setShowWelcome] = useState(
    () => typeof window !== "undefined" && !localStorage.getItem("myaistack_dashboard_welcomed")
  );
  const dismissWelcome = () => {
    localStorage.setItem("myaistack_dashboard_welcomed", "1");
    setShowWelcome(false);
  };

  return (
    <div>
      {showWelcome && (
        <div className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-6 mb-8">
          <h2 className="text-[18px] font-bold text-navy">Welcome.</h2>
          <p className="mt-2 text-navy text-[15px] leading-[1.6]">
            This is your Stack. Three tools picked from the 17 I use, based on what you told me. Read the cards. Try the prompts. The bookmark on each card saves it for later. <em>— Zach</em>
          </p>
          <button
            onClick={dismissWelcome}
            className="mt-4 inline-flex items-center justify-center border border-navy text-navy px-4 py-2 rounded-[8px] text-[13.5px] font-medium hover:bg-navy/5 transition-colors duration-200 ease-out"
          >
            Got it →
          </button>
        </div>
      )}
      {/* Title + intro */}
      {stackLabel && (
        <p className="text-[13px] italic text-navy/70 mb-1">Stack: {stackLabel}</p>
      )}
      <h3 className="text-[32px] sm:text-[36px] font-bold tracking-[-0.02em]">{title}</h3>
      {isDashboard && (
        <div className="mt-6 bg-navy-light/40 border border-navy-light rounded-[12px] px-5 py-4">
          <p className="text-[14px] text-navy leading-[1.55]">
            <span className="font-semibold">Read this first:</span> The Master Prompt Guide in Foundations. It's the briefing skill — context, job, constraints, output, follow-up — that makes every tool below sharper.{" "}
            <Link to="../foundations" className="font-medium underline underline-offset-2 hover:opacity-80">
              Open it →
            </Link>
          </p>
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-navy/65 font-mono text-[11px] tracking-[0.12em] uppercase">View</span>
        <div className="ml-1 flex gap-1.5">
          <button
            onClick={() => setMode("everything")}
            className={`px-3 py-1.5 rounded-[8px] transition-colors duration-200 ease-out ${
              mode === "everything"
                ? "bg-navy text-primary-foreground"
                : "bg-background border border-[hsl(var(--border))] text-navy hover:border-navy/40"
            }`}
          >
            Show me everything
          </button>
          <button
            onClick={() => setMode("guided")}
            className={`px-3 py-1.5 rounded-[8px] transition-colors duration-200 ease-out ${
              mode === "guided"
                ? "bg-navy text-primary-foreground"
                : "bg-background border border-[hsl(var(--border))] text-navy hover:border-navy/40"
            }`}
          >
            Guide me step by step
          </button>
        </div>
      </div>

      <div className="mt-8 font-mono text-[11px] tracking-[0.12em] text-navy/55 uppercase">Your situation</div>
      <div className="mt-1 mb-1 h-px w-10 bg-navy/30" />
      <p className="mt-3 text-navy text-[17px] leading-[1.7]">
        Here's what I'm reading: you're {onboardingRole ? rolePhrase(onboardingRole) : audiencePhrase(c2)}{onboardingTimeBudget ? `, with ${timeBudgetPhrase(onboardingTimeBudget)}` : ""}, working on {useCasePhrase(c3, q3OtherText)}, {confidencePhrase(c4)}. Three tools, and what's worth doing tonight. If that's slightly off,{" "}
        <button
          onClick={handleStartOver}
          className="text-navy underline underline-offset-2 hover:opacity-80"
        >
          Start over
        </button>.
      </p>

      {/* Jump-to nav strip */}
      {mode === "everything" && picks.length > 1 && (
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
      {mode === "everything" && (
      <div className="mt-10 flex flex-col gap-7">
        {picks.map((k, i) => {
          const t = TOOLS[k];
          const tChunks = chunksByTool[t.slug] ?? [];
          const grouped = groupChunks(tChunks);
          const hasAnyChunks = tChunks.length > 0;
          return (
            <Fragment key={k}>
              {i === 0 && (
                <div className="mb-3 mt-2">
                  <div className="font-mono text-[10px] tracking-[0.15em] text-navy/55 uppercase">Begin</div>
                  <p className="mt-1 italic text-[14px] text-navy/80 font-medium">
                    Start here tonight ↓
                  </p>
                </div>
              )}
              <div
                id={`tool-${t.slug}`}
                onClick={() => setDetailSlug(t.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") setDetailSlug(t.slug); }}
                className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-5 sm:p-6 scroll-mt-[80px] transition-colors duration-200 ease-out hover:border-navy/30 cursor-pointer"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="font-mono text-[13px] text-navy/60">{t.num}</span>
                    <h4 className="text-[20px] font-bold text-navy">{t.name}</h4>
                    {toolStatusMap[t.slug]?.status === "update" && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] bg-navy-light/70 text-navy px-2 py-0.5 rounded-[4px] whitespace-nowrap">
                        Update available
                      </span>
                    )}
                    {toolStatusMap[t.slug]?.status === "deprecated" && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em] bg-destructive/15 text-destructive px-2 py-0.5 rounded-[4px] whitespace-nowrap">
                        Deprecated
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.05em] text-navy/45 shrink-0">Tool {i + 1} of {picks.length}</span>
                </div>
                {statusByTool[t.slug]?.status === "update" && statusByTool[t.slug]?.update_message && (
                  <div className="mt-4 bg-navy text-primary-foreground rounded-[8px] px-4 py-3 text-[14px] leading-[1.55]">
                    <span className="font-semibold">Update:</span> {statusByTool[t.slug]?.update_message}
                  </div>
                )}
                {statusByTool[t.slug]?.status === "deprecated" && (
                  <div className="mt-4 bg-navy text-primary-foreground rounded-[8px] px-4 py-3 text-[14px] leading-[1.55]">
                    <span className="font-semibold">Heads up:</span> I wouldn't start here anymore. {statusByTool[t.slug]?.update_message ?? "There's a better tool for this now — check the others in your stack."}
                  </div>
                )}
                <p className="mt-3 text-navy text-[16px] leading-[1.65]">{why(k)}</p>
                <p className="mt-3 mb-1 text-[13px] italic text-navy/65 leading-[1.55]">
                  {whyThisTool(t.slug, c2, c3, c4, q3OtherText, aiPickReasoning?.[t.slug])}
                </p>

                {hasAnyChunks && (
                  <div className="mt-6 flex flex-col gap-5">
                    {SECTION_LABELS.map((s) => {
                      const items = grouped[s.key];
                      if (!items || items.length === 0) return null;
                      return (
                        <div key={s.key}>
                          <div className="mt-1 mb-3">
                            <div className="font-mono text-[11px] tracking-[0.08em] text-navy">
                              {s.label}
                            </div>
                            <div className="mt-1.5 h-px w-12 bg-navy/30" />
                          </div>
                          <div className="flex flex-col gap-3">
                            {items.map((ch) => (
                              <div
                                key={ch.id}
                                onClick={(e) => e.stopPropagation()}
                                className="relative bg-card border border-[hsl(var(--border))] rounded-[12px] p-5 md:p-6 transition-colors duration-200 ease-out hover:border-navy/40 cursor-default"
                              >
                                {user && (
                                  <SaveChunkButton
                                    saved={savedChunkIds.has(ch.id)}
                                    onClick={() => toggleSave(ch.id)}
                                  />
                                )}
                                <Collapsible defaultOpen={ch.chunk_type === "first-prompt"} className="pr-10">
                                  <CollapsibleTrigger className="group flex w-full items-center justify-between text-left rounded-[6px] -mx-1 px-1 py-1 hover:bg-navy-light/30 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2">
                                    <span className="text-[15px] font-semibold text-navy">{ch.title || ch.chunk_type}</span>
                                    <ChevronDown className="h-4 w-4 text-navy/60 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180 shrink-0 ml-3" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="pt-3 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                                    <ChunkBlock chunk={ch} showTitle={false} />
                                    <div className="mt-3 flex justify-end">
                                      <ChunkFeedbackButton chunkId={ch.id} toolSlug={t.slug} sessionId={sessionId} />
                                    </div>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div
                  className="mt-6 pt-4 border-t border-foreground/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {fullGuideUrl(t.slug) && (
                    <a href={fullGuideUrl(t.slug)!} target="_blank" rel="noopener noreferrer"
                       className="block text-[13px] italic text-navy/70 hover:text-navy underline underline-offset-2 mb-3">
                      Download the full guide (.docx) ↓
                    </a>
                  )}
                  {!feedbackOpen[t.slug] && !feedbackSubmitted[t.slug] && (
                    <button
                      onClick={() => setFeedbackOpen((prev) => ({ ...prev, [t.slug]: true }))}
                      className="text-[13px] italic text-navy/60 hover:text-navy underline underline-offset-2"
                    >
                      Not for me ↓
                    </button>
                  )}

                  {feedbackOpen[t.slug] && !feedbackSubmitted[t.slug] && (
                    <div className="flex flex-col gap-2">
                      <p className="text-[13px] italic text-navy/65">Why's this not landing?</p>
                      {[
                        { reason: "audience-wrong", label: "Wrong fit for who I am" },
                        { reason: "use-case-wrong", label: "Wrong fit for what I'm doing" },
                        { reason: "pace-wrong", label: "Wrong pace for me" },
                        { reason: "already-using", label: "Already using this" },
                      ].map((opt) => (
                        <button
                          key={opt.reason}
                          onClick={() => submitFeedback(t.slug, opt.reason)}
                          className="self-start text-[13px] text-navy underline underline-offset-2 hover:opacity-80"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {feedbackSubmitted[t.slug] && (
                    <p className="text-[13px] italic text-navy/60">Thanks — noted.</p>
                  )}
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); setDetailSlug(t.slug); }}
                  className="mt-5 italic text-[13px] text-navy/70 hover:text-navy underline underline-offset-2"
                >
                  Read the full guide for {t.name} →
                </button>
              </div>
            </Fragment>
          );
        })}
      </div>
      )}

      {mode === "guided" && (
        <div className="mt-10">
          {guidedSteps.length === 0 ? (
            <p className="italic text-foreground/60">Loading your stack…</p>
          ) : guidedIndex >= guidedSteps.length ? (
            <div className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-8 text-center">
              <h4 className="text-[20px] font-bold text-navy">You've worked through your stack.</h4>
              <p className="mt-3 text-foreground/85 text-[15px] leading-[1.65]">
                That's everything in priority order. Now go try one of the prompts in real life.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => { setGuidedIndex(0); }}
                  className="bg-navy text-primary-foreground px-4 py-2 rounded-[8px] text-[14px] font-medium"
                >
                  Take it from the top
                </button>
                <button
                  onClick={() => { setMode("everything"); }}
                  className="border border-[hsl(var(--border))] text-navy hover:border-navy/40 px-4 py-2 rounded-[8px] text-[14px] font-medium"
                >
                  Switch to everything view
                </button>
              </div>
            </div>
          ) : (
            (() => {
              const step = guidedSteps[guidedIndex];
              const tool = TOOLS[step.toolKey];
              return (
                <div className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-6 sm:p-8">
                  <div className="font-mono text-[11px] tracking-[0.08em] text-navy/65 uppercase">
                    Step {guidedIndex + 1} of {guidedSteps.length} · {tool.name} · {step.sectionLabel}
                  </div>
                  <div className="mt-1 mb-4 h-px w-12 bg-navy/30" />
                  <ChunkBlock chunk={step.chunk} />
                  <div className="mt-7 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setGuidedIndex((i) => Math.max(0, i - 1))}
                      disabled={guidedIndex === 0}
                      className="text-[13px] text-navy/70 hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ← Back
                    </button>
                    <div className="flex gap-1.5">
                      {guidedSteps.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${
                            i === guidedIndex ? "bg-navy" : i < guidedIndex ? "bg-navy/50" : "bg-navy/15"
                          }`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setGuidedIndex((i) => i + 1)}
                      className="bg-navy text-primary-foreground px-4 py-2 rounded-[8px] text-[14px] font-medium"
                    >
                      Done — next →
                    </button>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Section break */}
      <div className="mt-20 mb-2 flex items-center justify-center gap-3 text-navy/30">
        <div className="h-px w-12 bg-navy/30" />
        <span className="font-mono text-[10px] tracking-[0.2em]">●</span>
        <div className="h-px w-12 bg-navy/30" />
      </div>

      {/* Where this leads — ladder */}
      <div className="mt-6">
        <h4 className="text-[24px] font-bold text-navy">Where this leads</h4>
        <p className="mt-3 text-foreground/85 text-[16px] leading-[1.7]">
          Using AI well isn't a list of tools. It's a skill that builds in stages. Here's the ladder:
        </p>
        <ol className="mt-7 space-y-5">
          {LADDER.map((s, i) => {
            const isCurrent = i + 1 === stageFromConfidence;
            return (
              <li
                key={i}
                className={`flex gap-4 py-2 ${isCurrent ? "bg-navy-light/40 -mx-3 px-3 rounded-[8px]" : ""}`}
              >
                <span className="shrink-0 w-8 h-8 rounded-full bg-navy text-primary-foreground flex items-center justify-center text-[14px] font-semibold">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-bold text-navy text-[16px]">{s.name}</p>
                    {isCurrent && (
                      <span className="font-mono text-[11px] tracking-[0.08em] text-navy shrink-0">You're here</span>
                    )}
                  </div>
                  <p className="mt-1 text-foreground/85 text-[15px] leading-[1.65]">{s.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-8 bg-navy-light/30 border border-navy-light rounded-[12px] px-6 py-5">
        <p className="text-navy/80 text-[16px] leading-[1.7] italic">
          That's the stack. If you do one thing tonight, take the prompt at the top of the first card. If you want to come back to this — save your link, or just take a screenshot.
        </p>
      </div>

      {/* Footer actions */}
      <div className="mt-14 text-[14px] text-navy">
        <button
          onClick={() => {
            const lines = [
              "Hi Claude. I just got my personalised AI stack from MY AI STACK (Zach Z's friends-and-family AI guide).",
              "",
              `About me: ${audiencePhrase(c2)}, working on ${useCasePhrase(c3, q3OtherText)}, ${confidencePhrase(c4)}.`,
              "",
              "My three tools (in the order they were recommended):",
              "",
              ...picks.map((k, i) => `${i + 1}. ${TOOLS[k].name} — ${whyThisTool(TOOLS[k].slug, c2, c3, c4, q3OtherText, aiPickReasoning?.[TOOLS[k].slug])}`),
              "",
              "Use the Master Prompt Guide approach with me:",
              "",
              "1. Before answering, ask me up to 3 clarifying questions about my actual situation (the Ask-Me-First Flip).",
              "2. Then give me your first version. I'll push back if it's too generic.",
              "3. After we land an answer, audit it: what's weak, what did you assume about me, what's the strongest counter-argument? (The Audit Prompt)",
              "",
              "Don't preach the method — use it.",
              "",
              "Help me think through how to actually use these three tools tonight.",
            ];
            const url = `https://claude.ai/new?q=${encodeURIComponent(lines.join("\n"))}`;
            window.open(url, "_blank", "noopener,noreferrer");
          }}
          className="hover:underline transition-colors duration-200 ease-out"
        >
          Discuss your stack in Claude
        </button>
        <span className="text-foreground/40 mx-2">·</span>
        <button
          onClick={handleCopyShareLink}
          disabled={!sessionId}
          className="hover:underline transition-colors duration-200 ease-out disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
        >
          {linkCopied ? "Copied" : "Copy share link"}
        </button>
        <span className="text-foreground/40 mx-2">·</span>
        <button
          onClick={() => {
            setLabelDraft(stackLabel ?? "");
            setRenaming(true);
          }}
          className="hover:underline transition-colors duration-200 ease-out"
        >
          {stackLabel ? "Rename stack" : "Name this stack"}
        </button>
        <span className="text-foreground/40 mx-2">·</span>
        <button
          onClick={handleStartOver}
          className="hover:underline transition-colors duration-200 ease-out"
        >
          Start over
        </button>
        <span className="text-foreground/40 mx-2">·</span>
        <a href="/stack#tools" className="hover:underline transition-colors duration-200 ease-out">
          Browse all 17 tools ↓
        </a>
        {renaming && (
          <div className="mt-4 flex flex-col sm:flex-row gap-2 items-start">
            <input
              type="text"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              placeholder="e.g. Research stack, Side project stack"
              maxLength={60}
              className="flex-1 h-10 rounded-[8px] border border-[hsl(var(--border))] bg-background px-3 text-[14px] focus:outline-none focus:border-navy"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const label = labelDraft.trim().slice(0, 60);
                  if (!label || !sessionId) return;
                  setSaving(true);
                  await supabase.from("sessions").update({ stack_label: label }).eq("id", sessionId);
                  setRenaming(false);
                  setLabelDraft("");
                  window.location.reload();
                }}
                disabled={!labelDraft.trim() || saving}
                className="bg-navy text-primary-foreground rounded-[8px] px-4 h-10 text-[14px] font-medium disabled:opacity-40"
              >
                Save name
              </button>
              <button
                onClick={() => { setRenaming(false); setLabelDraft(""); }}
                className="text-navy hover:underline px-3 h-10 text-[14px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <ToolDetailDrawer
        open={detailSlug !== null}
        onOpenChange={(o) => { if (!o) setDetailSlug(null); }}
        toolSlug={detailSlug}
      />
    </div>
  );
};

export default MyStack;
