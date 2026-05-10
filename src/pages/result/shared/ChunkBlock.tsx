import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Chunk } from "./types";
import { splitFirstPrompt } from "./chunks";

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

export const ChunkBlock = ({ chunk, showTitle = true }: { chunk: Chunk; showTitle?: boolean }) => {
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
      {showTitle && chunk.title && (
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
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={`https://claude.ai/new?q=${encodeURIComponent(split.prompt)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-navy text-primary-foreground px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
            >
              Try this prompt in Claude →
            </a>
            <button
              onClick={() => handleCopy(split.prompt!)}
              className="inline-flex items-center justify-center border border-navy text-navy px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium hover:bg-background/60 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
            >
              {copied ? "Copied" : "Copy prompt"}
            </button>
          </div>
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
