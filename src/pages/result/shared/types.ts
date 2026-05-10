export type ToolKey =
  | "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09"
  | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17";

export type Q2Code = "student" | "personal" | "business" | "exploring";
export type Q3Code = "writing" | "research" | "building" | "notes" | "images" | "admin" | "other";
export type Q4Code = "never" | "tried" | "weekly" | "confident";
export type Q5Code = "prompt" | "video" | "guide" | "stepbystep";
export type RoleCode = "founder" | "solo" | "team-lead" | "ic" | "student" | "personal" | "retired";
export type TimeBudgetCode = "15min" | "30min" | "1hr" | "several" | "open";
export type ExistingToolCode = "chatgpt" | "claude" | "gemini" | "copilot" | "perplexity" | "other-ai" | "nothing-yet";

export type Chunk = {
  id: string;
  tool_id: string;
  chunk_type: string;
  title: string | null;
  content: string;
  priority: number;
};

export type ToolStatus = { status: string; update_message: string | null };

export type LoadedSession = {
  name: string | null;
  q2_audience: string | null;
  q3_use_case: string | null;
  q3_other_text: string | null;
  q4_confidence: string | null;
  q5_learning_style: string | null;
  ai_picked_tools?: string[] | null;
  ai_picked_at?: string | null;
  ai_pick_reasoning?: Record<string, string> | null;
  stack_label?: string | null;
  onboarding_role?: string | null;
  onboarding_time_budget?: string | null;
  onboarding_existing_tools?: string[] | null;
};

export type QuizStep = "intro" | "q1" | "q2" | "role" | "q3" | "tools" | "q4" | "time" | "done";
