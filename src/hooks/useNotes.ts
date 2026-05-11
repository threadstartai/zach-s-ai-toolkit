import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Note = {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  summary_updated_at: string | null;
  pinned: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export const deriveTitle = (htmlContent: string): string => {
  const stripped = htmlContent.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return stripped.slice(0, 80) || "Untitled note";
};

const sortNotes = (rows: Note[]): Note[] =>
  [...rows].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updated_at.localeCompare(a.updated_at);
  });

export const useNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("notes")
      .select("id, title, content, summary, summary_updated_at, pinned, tags, created_at, updated_at")
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    if (!error && data) setNotes(data as Note[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  const create = async (overrides?: Partial<Note>): Promise<Note | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        title: overrides?.title ?? "",
        content: overrides?.content ?? "",
        pinned: overrides?.pinned ?? false,
        tags: overrides?.tags ?? [],
      })
      .select("id, title, content, summary, summary_updated_at, pinned, tags, created_at, updated_at")
      .single();
    if (error || !data) return null;
    setNotes((prev) => sortNotes([data as Note, ...prev]));
    return data as Note;
  };

  const update = async (id: string, patch: Partial<Note>): Promise<void> => {
    setNotes((prev) =>
      sortNotes(
        prev.map((n) =>
          n.id === id ? { ...n, ...patch, updated_at: new Date().toISOString() } : n,
        ),
      ),
    );
    const { error } = await supabase.from("notes").update(patch).eq("id", id);
    if (error) {
      console.error("update note failed", error);
      await refresh();
    }
  };

  const remove = async (id: string): Promise<void> => {
    const prev = notes;
    setNotes((curr) => curr.filter((n) => n.id !== id));
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      console.error("delete note failed", error);
      setNotes(prev);
    }
  };

  const togglePin = async (id: string): Promise<void> => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    await update(id, { pinned: !target.pinned });
  };

  const summarise = async (id: string): Promise<void> => {
    const { data, error } = await supabase.functions.invoke("summarise-notes", {
      body: { note_id: id },
    });
    if (error || !data?.summary) {
      console.error("summarise failed", error || data);
      return;
    }
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, summary: data.summary, summary_updated_at: new Date().toISOString() }
          : n,
      ),
    );
  };

  return { notes, loading, refresh, create, update, remove, togglePin, summarise };
};
