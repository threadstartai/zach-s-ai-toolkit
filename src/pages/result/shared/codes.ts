import type { Q2Code, Q3Code, Q4Code, Q5Code } from "./types";

export const codeQ2 = (q: string | null): Q2Code => {
  if (q === "Student") return "student";
  if (q === "Personal life / family") return "personal";
  if (q === "Business / work") return "business";
  return "exploring";
};
export const codeQ3 = (q: string | null): Q3Code => {
  switch (q) {
    case "Writing something properly": return "writing";
    case "Researching a topic": return "research";
    case "Building a website or tool": return "building";
    case "Note-taking and meetings": return "notes";
    case "Generating images or video": return "images";
    case "Sorting admin or emails": return "admin";
    default: return "other";
  }
};
export const codeQ4 = (q: string | null): Q4Code => {
  if (q === "Never used it") return "never";
  if (q === "Tried it a bit") return "tried";
  if (q === "Use it weekly") return "weekly";
  return "confident";
};
export const codeQ5 = (q: string | null): Q5Code => {
  if (q === "Show me a video") return "video";
  if (q === "I'll read a guide") return "guide";
  if (q === "Walk me through it step by step") return "stepbystep";
  return "prompt";
};

export const Q2_FROM_CODE: Record<string, string> = {
  student: "Student",
  personal: "Personal life / family",
  business: "Business / work",
  exploring: "Just exploring",
};
export const Q3_FROM_CODE: Record<string, string> = {
  writing: "Writing something properly",
  research: "Researching a topic",
  building: "Building a website or tool",
  notes: "Note-taking and meetings",
  images: "Generating images or video",
  admin: "Sorting admin or emails",
};
export const Q4_FROM_CODE: Record<string, string> = {
  never: "Never used it",
  tried: "Tried it a bit",
  weekly: "Use it weekly",
  confident: "Pretty confident",
};
export const Q5_FROM_CODE: Record<string, string> = {
  prompt: "Just give me the prompt to copy",
  video: "Show me a video",
  guide: "I'll read a guide",
  "step-by-step": "Walk me through it step by step",
};

export const Q5_EDGE_MAP: Record<Q5Code, string> = {
  prompt: "prompt",
  video: "video",
  guide: "guide",
  stepbystep: "step-by-step",
};

export const isMeaningfulName = (raw: string) => {
  const n = raw.trim();
  if (n.length < 2) return false;
  if (!/^[A-Za-z][A-Za-z'\- ]*$/.test(n)) return false;
  if (!/[aeiouy]/i.test(n)) return false;
  return true;
};

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
