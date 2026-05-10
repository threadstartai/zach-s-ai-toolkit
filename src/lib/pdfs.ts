const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const PDF_SLUGS = new Set<string>([
  "claude","claude-code","co-pilot","chatgpt","grok","gemini","perplexity","manus","notebooklm",
  "lovable","base44","higgsfield","artlist","nano-banana-veo","wispr-flow","granola","obsidian",
  "start-here","why-i-made-this","the-process","how-this-was-built",
  "building-things-overview","master-prompt-guide","power-ups","pass-this-on",
]);

export const fullGuideUrl = (slug: string): string | null => {
  if (!PDF_SLUGS.has(slug)) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/guides/${slug}.pdf`;
};
