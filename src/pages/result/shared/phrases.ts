import type { Q2Code, Q3Code, Q4Code } from "./types";

export const audiencePhrase = (q2: Q2Code): string => {
  if (q2 === "student") return "you're a student";
  if (q2 === "personal") return "this is for personal life";
  if (q2 === "business") return "this is for business or work";
  return "you're exploring AI";
};

export const useCasePhrase = (q3: Q3Code, q3OtherText: string): string => {
  if (q3 === "writing") return "writing";
  if (q3 === "research") return "research";
  if (q3 === "building") return "building things";
  if (q3 === "notes") return "note-taking and meetings";
  if (q3 === "images") return "images and video";
  if (q3 === "admin") return "admin and emails";
  const cleaned = (q3OtherText || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
  if (!cleaned) return "what you're working on";
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
};

export const confidencePhrase = (q4: Q4Code): string => {
  if (q4 === "never") return "starting from scratch";
  if (q4 === "tried") return "with a bit of experience";
  if (q4 === "weekly") return "using AI regularly";
  return "comfortable enough to push it further";
};

export const rolePhrase = (role: string | null | undefined): string => {
  if (!role) return "";
  if (role === "founder") return "a founder";
  if (role === "solo") return "freelance";
  if (role === "team-lead") return "leading a team";
  if (role === "ic") return "in an individual role";
  if (role === "student") return "a student";
  if (role === "personal") return "using this for personal life";
  if (role === "retired") return "exploring";
  return "";
};

export const timeBudgetPhrase = (tb: string | null | undefined): string => {
  if (!tb) return "";
  if (tb === "15min") return "about 15 minutes a week";
  if (tb === "30min") return "about 30 minutes a week";
  if (tb === "1hr") return "about an hour a week";
  if (tb === "several") return "several hours a week";
  if (tb === "open") return "open-ended time";
  return "";
};

const _confidencePlaceholder = (q4: Q4Code): string => {
  if (q4 === "never") return "starting from scratch";
  if (q4 === "tried") return "with a bit of experience";
  if (q4 === "weekly") return "using AI regularly";
  return "comfortable enough to push it further";
};

export const whyThisTool = (
  slug: string,
  q2: Q2Code,
  q3: Q3Code,
  q4: Q4Code,
  q3OtherText: string,
  aiReason?: string,
): string => {
  if (aiReason && aiReason.trim().length > 0) return aiReason.trim();
  const aud = audiencePhrase(q2);
  const use = useCasePhrase(q3, q3OtherText);
  const conf = confidencePhrase(q4);

  if (slug === "claude") {
    return `Because ${aud}, thinking through ${use}, Claude is where everyone starts.`;
  }
  if (slug === "chatgpt" && (q4 === "never" || q4 === "tried")) {
    return `Because the easiest way in for ${use} is ChatGPT, especially ${conf}.`;
  }
  if (slug === "lovable" && q3 === "building") {
    return `Because building things is what Lovable was made for, and ${conf} is the right level to start.`;
  }
  if (slug === "wispr-flow") {
    return `Because typing slows down ${use} more than people realise.`;
  }
  if (slug === "notebooklm" && q2 === "student") {
    return `Because students working on ${use} benefit most from feeding sources to AI.`;
  }
  if (slug === "perplexity" && q3 === "research") {
    return `Because ${use} is where cited answers beat uncited ones.`;
  }
  if (slug === "manus" && q4 === "confident") {
    return `Because at ${conf} level, you can hand longer ${use} tasks off entirely.`;
  }
  return `Because ${aud}, working on ${use}, ${conf}.`;
};

export const introQ2 = (q2: Q2Code) =>
  q2 === "student" ? "Built for student work"
  : q2 === "personal" ? "Built for personal life and family"
  : q2 === "business" ? "Built for business and work"
  : "Built for exploring AI";

export const introQ4 = (q4: Q4Code) =>
  q4 === "never" ? "starting from never having used AI"
  : q4 === "tried" ? "starting from a bit of experience"
  : q4 === "weekly" ? "starting from regular use"
  : "starting from a confident base";

export const ladderLine = (c4: Q4Code): string => {
  if (c4 === "never") return "You're at Stage 1. That's where everyone starts.";
  if (c4 === "tried") return "You're between Stage 1 and 2. The next move is adding context.";
  if (c4 === "weekly") return "You're around Stage 2 or 3. The next move is checking what AI tells you.";
  return "You're past Stage 3. The next moves are reuse and automation — most people never get here.";
};
