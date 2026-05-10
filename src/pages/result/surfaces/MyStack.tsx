import { Fragment } from "react";
import { useResultContext } from "../shared/useResultContext";
import { useAuth } from "@/contexts/AuthContext";
import { TOOLS, whyFor, whyForChatGPT } from "../shared/tools";
import { audiencePhrase, useCasePhrase, confidencePhrase, whyThisTool, ladderLine } from "../shared/phrases";
import { SECTION_LABELS, LADDER, groupChunks } from "../shared/chunks";
import { ChunkBlock } from "../shared/ChunkBlock";
import { SaveChunkButton } from "../shared/SaveChunkButton";
import type { ToolKey } from "../shared/types";

const MyStack = () => {
  const {
    title, picks, c2, c3, c4, q3OtherText, q3,
    chunksByTool, statusByTool, showSlowMessage,
    feedbackOpen, feedbackSubmitted, setFeedbackOpen, submitFeedback,
    sessionId, linkCopied, handleCopyShareLink, handleStartOver,
    saved, setSaved,
    savedChunkIds, toggleSave,
  } = useResultContext();
  const { user } = useAuth();

  const why = (k: ToolKey) => k === "04" ? whyForChatGPT(c4) : whyFor(k, c2);

  return (
    <div>
      {/* Title + intro */}
      <h3 className="text-[32px] sm:text-[36px] font-bold text-navy tracking-[-0.02em]">{title}</h3>
      <p className="mt-3 text-navy text-[17px] leading-[1.7]">
        Here's what I'm reading: {audiencePhrase(c2)}, working on {useCasePhrase(c3, q3OtherText)}, {confidencePhrase(c4)}. Three tools, and what's worth doing tonight. If that's slightly off,{" "}
        <button
          onClick={handleStartOver}
          className="text-navy underline underline-offset-2 hover:opacity-80"
        >
          Start over
        </button>.
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
                className="bg-background border border-[hsl(var(--border))] rounded-[16px] p-6 sm:p-8 scroll-mt-[80px] transition-colors duration-150 hover:border-navy/30"
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono text-[13px] text-navy/60">{t.num}</span>
                  <h4 className="text-[22px] font-bold text-navy">{t.name}</h4>
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
                  {whyThisTool(t.slug, c2, c3, c4, q3OtherText)}
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
                                className="bg-background border border-[hsl(var(--border))] rounded-[12px] p-5 md:p-6 transition-colors duration-150 hover:border-navy/40"
                              >
                                <ChunkBlock chunk={ch} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-foreground/10">
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

      <p className="mt-12 text-navy/80 text-[16px] leading-[1.7] italic">
        That's the stack. If you do one thing tonight, take the prompt at the top of the first card. If you want to come back to this — save your link, or just take a screenshot.
      </p>

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
        <a href="/stack#tools" className="hover:underline transition-colors duration-150">
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

export default MyStack;
