import { useOutletContext } from "react-router-dom";
import type { Chunk, ToolKey, ToolStatus, Q2Code, Q3Code, Q4Code } from "./types";

export type ResultContext = {
  sessionId: string;
  name: string;
  q2: string | null;
  q3: string | null;
  q4: string | null;
  c2: Q2Code;
  c3: Q3Code;
  c4: Q4Code;
  q3OtherText: string;
  displayName: string | null;
  title: string;
  picks: ToolKey[];
  pickSlugs: string[];
  chunksByTool: Record<string, Chunk[]>;
  statusByTool: Record<string, ToolStatus>;
  showSlowMessage: boolean;
  feedbackOpen: Record<string, boolean>;
  feedbackSubmitted: Record<string, boolean>;
  saved: boolean;
  setSaved: (v: boolean) => void;
  linkCopied: boolean;
  handleStartOver: () => void;
  handleCopyShareLink: () => void;
  setFeedbackOpen: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  submitFeedback: (toolSlug: string, reason: string) => Promise<void>;
  savedChunkIds: Set<string>;
  toggleSave: (chunkId: string) => Promise<void>;
  aiPickReasoning: Record<string, string> | null;
};

export const useResultContext = () => useOutletContext<ResultContext>();
