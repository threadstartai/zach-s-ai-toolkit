import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

type AskDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
};

type Msg = { id: string; role: "user" | "assistant"; content: string };
type ConversationItem = { id: string; title: string | null; updated_at: string };

const SUGGESTIONS = [
  "What should I do tonight?",
  "Which tool should I start with and why?",
  "I don't get the audit prompt — explain it",
];

const markdownComponents = {
  p: ({ node, ...props }: any) => (
    <p className="text-[14.5px] leading-[1.65] mb-2 last:mb-0" {...props} />
  ),
  strong: ({ node, ...props }: any) => <strong className="font-semibold text-navy" {...props} />,
  em: ({ node, ...props }: any) => <em className="italic" {...props} />,
  ul: ({ node, ...props }: any) => (
    <ul className="list-disc pl-5 my-2 space-y-1 text-[14.5px] leading-[1.65]" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="list-decimal pl-5 my-2 space-y-1 text-[14.5px] leading-[1.65]" {...props} />
  ),
  li: ({ node, ...props }: any) => <li {...props} />,
  blockquote: ({ node, ...props }: any) => (
    <blockquote className="my-2 border-l-[3px] border-navy pl-3 italic text-[14.5px] leading-[1.65]" {...props} />
  ),
  code: ({ node, ...props }: any) => (
    <code className="font-mono text-[13px] bg-background/60 px-1.5 py-0.5 rounded" {...props} />
  ),
  a: ({ node, ...props }: any) => (
    <a className="text-navy underline underline-offset-2 hover:opacity-80" {...props} />
  ),
};

export const AskDrawer = ({ open, onOpenChange, sessionId }: AskDrawerProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const loadedRef = useRef<string | null>(null);

  // Load latest conversation when drawer opens for this session
  useEffect(() => {
    if (!open || !sessionId) return;
    if (loadedRef.current === sessionId) return;
    loadedRef.current = sessionId;

    (async () => {
      const { data: convs } = await supabase
        .from("conversations")
        .select("id, updated_at")
        .eq("session_id", sessionId)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (convs && convs[0]) {
        setConversationId(convs[0].id);
        const { data: msgs } = await supabase
          .from("messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", convs[0].id)
          .order("created_at", { ascending: true });
        if (msgs) {
          setMessages(
            msgs
              .filter((m: any) => m.role !== "system")
              .map((m: any) => ({ id: m.id, role: m.role, content: m.content }))
          );
        }
      }
    })();
  }, [open, sessionId]);

  // Auto-scroll on new messages or sending
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [input]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || sending) return;

    const tempId = `temp-${Date.now()}`;
    setMessages((m) => [...m, { id: tempId, role: "user", content: text }]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const { data, error: invokeErr } = await supabase.functions.invoke("ask-stack", {
        body: {
          session_id: sessionId,
          conversation_id: conversationId ?? undefined,
          message: text,
        },
      });

      if (invokeErr || !data?.content) {
        throw new Error(invokeErr?.message ?? "no content");
      }

      if (data.conversation_id) setConversationId(data.conversation_id);
      setMessages((m) => [
        ...m,
        {
          id: data.message_id ?? `assist-${Date.now()}`,
          role: "assistant",
          content: data.content,
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Couldn't reach the assistant. Try again.",
        },
      ]);
      setError("Couldn't reach the assistant. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleSuggestion = (s: string) => {
    setInput(s);
    void send(s);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] flex flex-col p-0 gap-0"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[hsl(var(--border))]">
          <h2 className="text-[20px] font-bold text-navy">Ask about your stack</h2>
          <p className="mt-1 text-[13px] italic text-navy/65 leading-[1.5]">
            Trained on your three tools and your situation. Push back if it's being lazy.
          </p>
        </div>

        {/* Messages / empty */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5">
          {messages.length === 0 ? (
            <div>
              <p className="text-[14.5px] text-foreground/85 leading-[1.65]">
                Ask anything about your stack. I'll use the Master Prompt Guide approach — clarifying questions first, then push back if I see it.
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="text-left text-[13.5px] text-navy bg-navy-light/40 hover:bg-navy-light/60 border border-navy-light rounded-[12px] px-4 py-2.5 transition-colors duration-150"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "self-end max-w-[85%] bg-navy text-primary-foreground rounded-[12px] px-4 py-2.5 text-[14.5px] leading-[1.55] whitespace-pre-wrap"
                      : "self-start max-w-[85%] bg-navy-light/30 text-foreground rounded-[12px] px-4 py-2.5"
                  }
                >
                  {m.role === "assistant" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input footer */}
        <div className="border-t border-[hsl(var(--border))] px-6 pt-3 pb-5">
          {sending && (
            <p className="mb-2 text-[12.5px] italic text-navy/65">Thinking…</p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your stack…"
              rows={1}
              className="flex-1 resize-none border border-[hsl(var(--border))] focus:border-navy/50 focus:outline-none rounded-[8px] px-3 py-2 text-[14.5px] leading-[1.5] bg-background text-foreground"
              style={{ maxHeight: 200 }}
            />
            <button
              onClick={() => send()}
              disabled={sending || input.trim().length === 0}
              className="bg-navy text-primary-foreground rounded-[8px] px-4 py-2 text-[14px] font-medium hover:opacity-90 transition-opacity duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AskDrawer;
