import { useCallback, useEffect, useRef, useState } from "react";
import NoteEditor from "@/components/notes/NoteEditor";
import { Note, deriveTitle, useNotes } from "@/hooks/useNotes";

const formatRelative = (iso: string): string => {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const NoteListItem = ({
  note,
  selected,
  onSelect,
}: {
  note: Note;
  selected: boolean;
  onSelect: () => void;
}) => {
  const preview = note.content.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").slice(0, 80);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left px-4 py-3 border-b border-[hsl(var(--border))]/60 hover:bg-navy-light/20 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:bg-navy-light/30 ${
        selected ? "bg-navy-light/40" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {note.pinned && <span className="text-navy text-[10px]" aria-label="Pinned">★</span>}
        <p className="text-[14px] font-medium text-foreground truncate flex-1">
          {note.title || "Untitled note"}
        </p>
      </div>
      <p className="mt-1 text-[12px] text-foreground/55 line-clamp-2">{preview || "Empty"}</p>
      <p className="mt-1 text-[11px] text-foreground/45">{formatRelative(note.updated_at)}</p>
    </button>
  );
};

const TagsInput = ({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (t: string[]) => void;
}) => {
  const [input, setInput] = useState("");
  const addTag = () => {
    const v = input.trim().toLowerCase();
    if (!v || tags.includes(v)) {
      setInput("");
      return;
    }
    onChange([...tags, v]);
    setInput("");
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 bg-navy-light/40 text-navy text-[12px] rounded-full px-2.5 py-0.5"
        >
          {t}
          <button
            type="button"
            onClick={() => onChange(tags.filter((x) => x !== t))}
            className="hover:text-foreground"
            aria-label={`Remove ${t}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
          }
          if (e.key === "Backspace" && !input && tags.length > 0) {
            onChange(tags.slice(0, -1));
          }
        }}
        placeholder={tags.length === 0 ? "Add tags…" : ""}
        className="flex-1 min-w-[120px] bg-transparent text-[13px] outline-none placeholder:text-foreground/40"
      />
    </div>
  );
};

// Minimal debounce hook
const useDebouncedCallback = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay],
  );
};

const Notes = () => {
  const { notes, loading, create, update, remove, togglePin, summarise } = useNotes();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busySummarise, setBusySummarise] = useState(false);

  useEffect(() => {
    if (!selectedId && notes.length > 0) setSelectedId(notes[0].id);
  }, [notes, selectedId]);

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  const filtered = notes.filter((n) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleContentChange = useDebouncedCallback(async (html: string) => {
    if (!selected) return;
    const title = deriveTitle(html);
    await update(selected.id, { content: html, title });
  }, 800);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <aside
        className={`w-full md:w-[320px] md:border-r md:border-[hsl(var(--border))] flex-col bg-card ${
          selected ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="px-4 py-4 border-b border-[hsl(var(--border))] flex items-center gap-3">
          <h1 className="text-[18px] font-bold text-foreground tracking-[-0.01em]">Notes</h1>
          <button
            type="button"
            onClick={async () => {
              const n = await create();
              if (n) setSelectedId(n.id);
            }}
            className="ml-auto inline-flex items-center justify-center bg-navy text-primary-foreground rounded-[8px] px-3 h-8 text-[13px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
          >
            + New
          </button>
        </div>
        <div className="px-4 py-3 border-b border-[hsl(var(--border))]/60">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full h-9 bg-background border border-[hsl(var(--border))] rounded-[8px] px-3 text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="px-4 py-6 text-[13px] text-foreground/50 italic">Loading…</p>
          )}
          {!loading && filtered.length === 0 && (
            <p className="px-4 py-6 text-[13px] text-foreground/50 italic">
              {query ? "No matches." : "No notes yet. Tap + New to start."}
            </p>
          )}
          {filtered.map((n) => (
            <NoteListItem
              key={n.id}
              note={n}
              selected={n.id === selectedId}
              onSelect={() => setSelectedId(n.id)}
            />
          ))}
        </div>
      </aside>

      <section className={`flex-1 flex-col ${selected ? "flex" : "hidden md:flex"}`}>
        {!selected ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-[14px] text-foreground/55 italic">
              Pick a note on the left, or tap + New.
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-[hsl(var(--border))] flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="md:hidden text-[13px] text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
              >
                ← Notes
              </button>
              <p className="text-[13px] text-foreground/55">
                {formatRelative(selected.updated_at)}
              </p>
              <div className="ml-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => togglePin(selected.id)}
                  className="text-[13px] text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
                >
                  {selected.pinned ? "Unpin" : "Pin"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (busySummarise) return;
                    setBusySummarise(true);
                    await summarise(selected.id);
                    setBusySummarise(false);
                  }}
                  disabled={busySummarise}
                  className="text-[13px] text-navy hover:underline disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
                >
                  {busySummarise ? "Summarising…" : "Summarise"}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Delete this note?")) return;
                    await remove(selected.id);
                    setSelectedId(null);
                  }}
                  className="text-[13px] text-foreground/55 hover:text-foreground/85 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            {selected.summary && (
              <div className="px-6 pt-4">
                <div className="bg-navy-light/30 border border-navy-light/60 rounded-[10px] px-4 py-3">
                  <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy">
                    Summary
                  </p>
                  <p className="mt-2 italic text-[14px] text-foreground/85 leading-[1.6]">
                    {selected.summary}
                  </p>
                </div>
              </div>
            )}

            <div className="flex-1 px-6 py-5 overflow-y-auto">
              <NoteEditor
                key={selected.id}
                value={selected.content}
                onChange={handleContentChange}
                autoFocus
              />

              <div className="mt-5">
                <TagsInput
                  tags={selected.tags}
                  onChange={(t) => update(selected.id, { tags: t })}
                />
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Notes;
