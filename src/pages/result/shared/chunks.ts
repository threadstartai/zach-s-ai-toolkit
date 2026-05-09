import type { Chunk } from "./types";

export const SECTION_LABELS: { key: "why" | "tonight" | "worth"; label: string; types: string[] }[] = [
  { key: "why", label: "WHY", types: ["intro", "why-it-matters"] },
  { key: "tonight", label: "TONIGHT", types: ["setup", "first-prompt", "workflow-example"] },
  { key: "worth", label: "WORTH KNOWING", types: ["advanced", "common-mistake"] },
];

export const groupChunks = (chunks: Chunk[]) => {
  const groups: Record<string, Chunk[]> = { why: [], tonight: [], worth: [] };
  for (const c of chunks) {
    for (const s of SECTION_LABELS) {
      if (s.types.includes(c.chunk_type)) {
        groups[s.key].push(c);
        break;
      }
    }
  }
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }
  return groups;
};

export const splitFirstPrompt = (content: string) => {
  const lines = content.split("\n");
  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    const isQuote = /^>\s?/.test(lines[i]);
    if (isQuote && start === -1) start = i;
    if (start !== -1 && !isQuote && lines[i].trim() === "") continue;
    if (start !== -1 && !isQuote) { end = i; break; }
  }
  if (start === -1) return { before: content, prompt: null as string | null, after: "" };
  if (end === -1) end = lines.length;
  const before = lines.slice(0, start).join("\n").trim();
  const prompt = lines.slice(start, end).map((l) => l.replace(/^>\s?/, "")).join("\n").trim();
  const after = lines.slice(end).join("\n").trim();
  return { before, prompt, after };
};

export const LADDER = [
  { name: "Ask better questions.", desc: "Stop dumping vague briefs. Start saying what you actually want." },
  { name: "Add context.", desc: "Give the AI what it needs to be useful — examples, your style, the constraints." },
  { name: "Check the answer.", desc: "Don't trust the first reply. Ask what's weak about it." },
  { name: "Reuse what works.", desc: "When a prompt lands, save it. Build a small library that's yours." },
  { name: "Automate the boring bits.", desc: "Once you've got patterns that work, get them running on autopilot." },
];
