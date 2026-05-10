const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;

// Maps each slug to the EXACT filename in the public Supabase Storage `guides` bucket.
// Filenames are URL-encoded at fetch time to handle spaces, brackets, ampersands.
const FILENAME_MAP: Record<string, string> = {
  "claude": "Tool 1 - Claude (LLM).docx",
  "claude-code": "Tool 2 - Claude Code.docx",
  "co-pilot": "Tool 3 - Claude Co-Pilot.docx",
  "chatgpt": "Tool 4 - ChatGPT.docx",
  "grok": "Tool 5 - Grok.docx",
  "gemini": "Tool 6 - Gemini.docx",
  "perplexity": "Tool 7 - Perplexity.docx",
  "manus": "Tool 8 - Manus.docx",
  "notebooklm": "Tool 9 - NotebookLM.docx",
  "lovable": "Tool 10 - LOVABLE.docx",
  "base44": "Tool 11 - BASE44.docx",
  "higgsfield": "Tool 12 - HIGGSFIELD.docx",
  "artlist": "Tool 13 - ARTLIST.docx",
  "nano-banana-veo": "Tool 14 - NANO BANANA & VEO.docx",
  "wispr-flow": "Tool 15 - WisprFlow.docx",
  "granola": "Tool 16 - Granola.docx",
  "obsidian": "Tool 17 - Obsidian.docx",
  "start-here": "00-Start Here.docx",
  "why-i-made-this": "01-Why I Made This.docx",
  "the-process": "02-The Process.docx",
  "how-this-was-built": "03-How This Was Built.docx",
  "building-things-overview": "Building Things Overview.docx",
  "master-prompt-guide": "Your Master Prompt Guide V1.docx",
  "power-ups": "Power Ups V1 (Bonus).docx",
  "rules-with-ai": "Rules With AI.docx",
};

export const PDF_SLUGS = new Set<string>(Object.keys(FILENAME_MAP));

export const fullGuideUrl = (slug: string): string | null => {
  if (!SUPABASE_URL) return null;
  const filename = FILENAME_MAP[slug];
  if (!filename) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/guides/${encodeURIComponent(filename)}`;
};
