// Shared validation utilities for edge functions.

const AUDIENCES = ["student", "personal", "business", "exploring"] as const;
const USE_CASES = ["writing", "research", "building", "notes", "images", "admin", "other"] as const;
const CONFIDENCES = ["never", "tried", "weekly", "confident"] as const;
const LEARNING_STYLES = ["prompt", "video", "guide", "step-by-step"] as const;

export function sanitiseString(input: unknown, maxLength: number): string {
  if (typeof input !== "string") return "";
  // Strip HTML tags, collapse whitespace, trim, enforce length.
  const stripped = input.replace(/<[^>]*>/g, "");
  const trimmed = stripped.replace(/\s+/g, " ").trim();
  return trimmed.slice(0, maxLength);
}

export function isValidEmail(input: unknown): input is string {
  if (typeof input !== "string") return false;
  if (input.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

export function isValidAudience(input: unknown): input is typeof AUDIENCES[number] {
  return typeof input === "string" && (AUDIENCES as readonly string[]).includes(input);
}

export function isValidUseCase(input: unknown): input is typeof USE_CASES[number] {
  return typeof input === "string" && (USE_CASES as readonly string[]).includes(input);
}

export function isValidConfidence(input: unknown): input is typeof CONFIDENCES[number] {
  return typeof input === "string" && (CONFIDENCES as readonly string[]).includes(input);
}

export function isValidLearningStyle(input: unknown): input is typeof LEARNING_STYLES[number] {
  return typeof input === "string" && (LEARNING_STYLES as readonly string[]).includes(input);
}

export function isValidUuid(input: unknown): input is string {
  return typeof input === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);
}

export function getClientIP(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
