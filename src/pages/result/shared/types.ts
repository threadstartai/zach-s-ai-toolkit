export type ToolKey =
  | "01" | "02" | "03" | "04" | "06" | "07" | "08" | "09"
  | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17";

export type Q2Code = "student" | "personal" | "business" | "exploring";
export type Q3Code = "writing" | "research" | "building" | "notes" | "images" | "admin" | "other";
export type Q4Code = "never" | "tried" | "weekly" | "confident";
export type Q5Code = "prompt" | "video" | "guide" | "stepbystep";

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
};

export type QuizStep = "intro" | "q1" | "q2" | "q3" | "q4" | "done";
