import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useNotes } from "@/hooks/useNotes";

const NotesPreview = () => {
  const { notes, loading } = useNotes();

  const top = useMemo(() => {
    const pinned = notes.filter((n) => n.pinned).slice(0, 3);
    const recent = notes
      .filter((n) => !n.pinned)
      .slice(0, Math.max(0, 4 - pinned.length));
    return [...pinned, ...recent];
  }, [notes]);

  return (
    <section className="mt-6 border-t border-[hsl(var(--border))] pt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy">Notes</h2>
        <Link
          to="/dashboard/notes"
          className="text-[13px] text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
        >
          See all notes →
        </Link>
      </div>

      {loading ? (
        <p className="text-[14px] text-foreground/55 italic">Loading…</p>
      ) : top.length === 0 ? (
        <div>
          <p className="text-[14px] text-foreground/65 leading-[1.55]">
            No notes yet. Quick thoughts, prompts that worked, things to come back to — they all live here.
          </p>
          <Link
            to="/dashboard/notes"
            className="mt-3 inline-flex items-center justify-center bg-navy text-primary-foreground rounded-[8px] px-4 h-9 text-[13px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
          >
            + Create your first note
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {top.map((n) => {
            const preview = n.content
              .replace(/<[^>]+>/g, "")
              .replace(/\s+/g, " ")
              .slice(0, 100);
            return (
              <li key={n.id}>
                <Link
                  to="/dashboard/notes"
                  className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
                >
                  <div className="flex items-center gap-2">
                    {n.pinned && <span className="text-navy text-[10px]">★</span>}
                    <p className="text-[14px] font-medium text-foreground group-hover:underline">
                      {n.title || "Untitled note"}
                    </p>
                  </div>
                  <p className="mt-0.5 text-[12px] text-foreground/55 line-clamp-1">
                    {preview || "Empty"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default NotesPreview;
