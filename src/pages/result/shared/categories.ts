export type CategoryTool = { num?: string; name: string; tagline: string; slug: string };
export type CategoryData = { title: string; blurb: string; tools: CategoryTool[] };

export const CATEGORIES: CategoryData[] = [
  {
    title: "Foundationals",
    blurb: "The nine guides that make the rest of the Stack make sense.",
    tools: [
      { num: "00", name: "Start Here", tagline: "Where to begin and what order to read.", slug: "start-here" },
      { num: "01", name: "Why I Made This", tagline: "The honest reason this exists.", slug: "why-i-made-this" },
      { num: "02", name: "The Process", tagline: "The four-step loop I use for almost everything.", slug: "the-process" },
      { num: "03", name: "How This Was Built", tagline: "Behind the scenes.", slug: "how-this-was-built" },
      { name: "The Master Prompt Guide", tagline: "The prompt patterns worth memorising.", slug: "master-prompt-guide" },
      { name: "Rules With AI", tagline: "Honest guidance about staying yourself while using these tools.", slug: "rules-with-ai" },
      { name: "Building Things — Overview", tagline: "The whole landscape, in one place.", slug: "building-things-overview" },
      { name: "Power-Ups", tagline: "Small upgrades that make a big difference.", slug: "power-ups" },
      { name: "Pass This On", tagline: "Who this is for, and how to share it.", slug: "pass-this-on" },
    ],
  },
  {
    title: "Thinking & Writing",
    blurb: "Tools that help you think clearly and write better.",
    tools: [
      { num: "01", name: "Claude", tagline: "The thinking partner. Start here.", slug: "claude" },
      { num: "02", name: "Claude Code", tagline: "Claude in your terminal. For bigger work.", slug: "claude-code" },
      { num: "03", name: "Co-Pilot", tagline: "Claude inside Excel, Word, PowerPoint.", slug: "co-pilot" },
      { num: "04", name: "ChatGPT", tagline: "The all-rounder. Best mobile experience.", slug: "chatgpt" },
      { num: "05", name: "Grok", tagline: "When timing matters. Live news, real-time data.", slug: "grok" },
    ],
  },
  {
    title: "Research & Study",
    blurb: "Tools for going deep on a topic.",
    tools: [
      { num: "06", name: "Gemini", tagline: "Google's research assistant. Connected to Drive and Workspace.", slug: "gemini" },
      { num: "07", name: "Perplexity", tagline: "The research engine. Cited answers.", slug: "perplexity" },
      { num: "08", name: "Manus", tagline: "The connected work agent. For longer tasks.", slug: "manus" },
      { num: "09", name: "NotebookLM", tagline: "Turn any source into notes, audio, mind maps.", slug: "notebooklm" },
    ],
  },
  {
    title: "Building Things",
    blurb: "Tools for making websites, apps, content, video and images.",
    tools: [
      { name: "Building Things — Overview", tagline: "The whole landscape, in one place.", slug: "building-things-overview" },
      { num: "10", name: "Lovable", tagline: "Build a website by talking to AI.", slug: "lovable" },
      { num: "11", name: "Base44", tagline: "Build internal tools and apps.", slug: "base44" },
      { num: "12", name: "Higgsfield", tagline: "AI video that's actually good.", slug: "higgsfield" },
      { num: "13", name: "Artlist", tagline: "Music, sound, footage for anything you make.", slug: "artlist" },
      { num: "14", name: "Nano Banana & Veo", tagline: "Image and video generation, the current best.", slug: "nano-banana-veo" },
    ],
  },
  {
    title: "Daily Life",
    blurb: "Tools that fit into how you already work.",
    tools: [
      { num: "15", name: "Wispr Flow", tagline: "Voice-to-text. Faster than typing.", slug: "wispr-flow" },
      { num: "16", name: "Granola", tagline: "Meeting notes that write themselves.", slug: "granola" },
      { num: "17", name: "Obsidian", tagline: "Your second brain. Local, yours, forever.", slug: "obsidian" },
    ],
  },
];
