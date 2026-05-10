import type { RoleCode } from "@/pages/result/shared/types";

/**
 * Mini case studies — one per role, surfaced on the home dashboard greeting.
 * Keeps "AI power" abstract value grounded in specific lived examples.
 *
 * Source: Zach's voice. UK English. Concrete tool relays only — no buzzwords.
 */
export const CASE_STUDIES: Record<RoleCode, string> = {
  "founder": "Solo founders use Claude + Lovable to build the first version of their product before hiring anyone — a working prototype in a weekend, with Claude reviewing the code.",
  "solo": "Freelancers use Granola + Claude to turn five weekly client calls into five minutes of follow-up admin — meeting captured, distilled, follow-up actions drafted.",
  "team-lead": "Team leads use Claude Co-Pilot to brief a project once, then share the brief with the team — everyone working from the same context without re-explaining.",
  "ic": "ICs use Wispr Flow to type three times faster and Claude to audit the thinking — first draft in voice, polish via prompt, result in a fraction of the time.",
  "student": "Students pair NotebookLM and Perplexity — feed textbook chapters into NotebookLM for structured notes, use Perplexity to find verifiable sources for the essay.",
  "personal": "Parents use Claude to plan family meals, holidays, and admin — once-a-week briefing, bulk reply to school emails, find the kids' new shoes faster.",
  "retired": "People exploring use NotebookLM to organise family history — interview a relative, feed the transcript in, get a structured family record — and Claude to write thoughtful letters.",
};

export const caseStudyForRole = (role: string | null | undefined): string | null => {
  if (!role) return null;
  return CASE_STUDIES[role as RoleCode] ?? null;
};
