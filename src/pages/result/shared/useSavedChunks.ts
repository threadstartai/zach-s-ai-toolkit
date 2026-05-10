import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useSavedChunks = () => {
  const { user } = useAuth();
  const [savedChunkIds, setSavedChunkIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSavedChunkIds(new Set());
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .from("saved_chunks")
      .select("chunk_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (cancelled) return;
        if (data) setSavedChunkIds(new Set(data.map((r: any) => r.chunk_id)));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  const toggleSave = async (chunkId: string) => {
    if (!user) return;
    const isSaved = savedChunkIds.has(chunkId);
    setSavedChunkIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(chunkId); else next.add(chunkId);
      return next;
    });
    try {
      if (isSaved) {
        await supabase.from("saved_chunks").delete().eq("user_id", user.id).eq("chunk_id", chunkId);
      } else {
        await supabase.from("saved_chunks").insert({ user_id: user.id, chunk_id: chunkId });
      }
    } catch {
      setSavedChunkIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(chunkId); else next.delete(chunkId);
        return next;
      });
    }
  };

  return { savedChunkIds, loading, toggleSave };
};
