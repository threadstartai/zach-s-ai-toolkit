import type { ToolKey, Q2Code, Q3Code, Q4Code } from "./types";

export const TOOLS: Record<ToolKey, { num: string; name: string; tagline: string; slug: string }> = {
  "01": { num: "01", name: "Claude", tagline: "The thinking partner. Start here.", slug: "claude" },
  "02": { num: "02", name: "Claude Code", tagline: "Claude in your terminal. For bigger work.", slug: "claude-code" },
  "03": { num: "03", name: "Co-Pilot", tagline: "Claude inside Excel, Word, PowerPoint.", slug: "co-pilot" },
  "04": { num: "04", name: "ChatGPT", tagline: "The all-rounder. Best mobile experience.", slug: "chatgpt" },
  "06": { num: "06", name: "Gemini", tagline: "Google's research assistant. Connected to Drive and Workspace.", slug: "gemini" },
  "07": { num: "07", name: "Perplexity", tagline: "The research engine. Cited answers.", slug: "perplexity" },
  "08": { num: "08", name: "Manus", tagline: "The connected work agent. For longer tasks.", slug: "manus" },
  "09": { num: "09", name: "NotebookLM", tagline: "Turn any source into notes, audio, mind maps.", slug: "notebooklm" },
  "10": { num: "10", name: "Lovable", tagline: "Build a website by talking to AI.", slug: "lovable" },
  "11": { num: "11", name: "Base44", tagline: "Build internal tools and apps.", slug: "base44" },
  "12": { num: "12", name: "Higgsfield", tagline: "AI video that's actually good.", slug: "higgsfield" },
  "13": { num: "13", name: "Artlist", tagline: "Music, sound, footage for anything you make.", slug: "artlist" },
  "14": { num: "14", name: "Nano Banana & Veo", tagline: "Image and video generation, the current best.", slug: "nano-banana-veo" },
  "15": { num: "15", name: "Wispr Flow", tagline: "Voice-to-text. Faster than typing.", slug: "wispr-flow" },
  "16": { num: "16", name: "Granola", tagline: "Meeting notes that write themselves.", slug: "granola" },
  "17": { num: "17", name: "Obsidian", tagline: "Your second brain. Local, yours, forever.", slug: "obsidian" },
};

const ADVANCED_ORDER: ToolKey[] = ["08", "02", "11"];

export const recommend = (q2: Q2Code, q3: Q3Code, q4: Q4Code): ToolKey[] => {
  let picks: ToolKey[] = [];
  const beginner = q4 === "never" || q4 === "tried";
  const advanced = q4 === "weekly" || q4 === "confident";

  if (q3 === "writing") {
    picks = ["01"];
    if (beginner) picks.push("04");
    if (advanced) picks.push("02");
    if (q2 === "business") picks.push("03");
  } else if (q3 === "research") {
    if (q2 === "student") picks = ["09", "06", "01"];
    else if (q2 === "business") picks = ["07", "01", "09"];
    else picks = ["06", "07", "01"];
    if (q4 === "confident") picks[2] = "08";
  } else if (q3 === "building") {
    picks = ["10"];
    if (beginner) picks.push("01");
    if (advanced) picks.push("11");
    if (q2 === "business") picks.push("03");
  } else if (q3 === "notes") {
    picks = ["16", "15"];
    picks.push(advanced ? "17" : "01");
  } else if (q3 === "images") {
    picks = ["14", "12"];
    picks.push(q2 === "business" ? "13" : "01");
  } else if (q3 === "admin") {
    picks = ["01", "15"];
    if (q2 === "business") picks.push("03");
    if (q4 === "confident") picks.push("08");
  } else {
    picks = ["01", "04", "09"];
  }

  picks = Array.from(new Set(picks));

  while (picks.length > 3) {
    const drop = ADVANCED_ORDER.find((k) => picks.includes(k));
    if (!drop) { picks.pop(); continue; }
    picks = picks.filter((k) => k !== drop);
  }
  return picks;
};

export const whyFor = (key: ToolKey, q2: Q2Code): string => {
  switch (key) {
    case "01":
      if (q2 === "student") return "Because thinking through essays, plans and ideas is what Claude does best.";
      if (q2 === "business") return "Because you'll use it daily once it's set up properly.";
      if (q2 === "personal") return "Because it's the AI you'll keep coming back to for everything.";
      return "Because every AI workflow starts with one good thinking partner.";
    case "02":
      return "Because once you're comfortable, this is where the real depth opens up.";
    case "03":
      return "Because it lives inside Excel, Word and PowerPoint — where business work actually happens.";
    case "04":
      return "Because it's the easiest place to start. No setup, just ask.";
    case "06":
      if (q2 === "student") return "Because it sits inside Google Workspace where your work already is.";
      return "Because it's the AI hooked into Drive, Docs and your Google life.";
    case "07":
      return "Because answers with citations beat answers without.";
    case "08":
      return "Because once you trust AI, you can hand it real work to do.";
    case "09":
      if (q2 === "student") return "Because cramming gets easier when AI knows your sources.";
      return "Because feeding sources to AI changes how research works.";
    case "10":
      return "Because you describe what you want and it builds it. No code needed.";
    case "11":
      return "Because once Lovable clicks, this is where you build the harder stuff.";
    case "12":
      return "Because AI video has finally crossed the line from gimmick to useful.";
    case "13":
      return "Because every video needs music and footage you can actually use.";
    case "14":
      return "Because the current best image and video generators sit here.";
    case "15":
      return "Because typing slows you down. Talking is faster.";
    case "16":
      if (q2 === "business") return "Because nobody actually writes good meeting notes. This does.";
      return "Because meeting notes write themselves now. Use the time elsewhere.";
    case "17":
      return "Because once you're storing ideas long-term, this is where they live.";
  }
};

export const whyForChatGPT = (q4: Q4Code): string => {
  if (q4 === "tried") return "Because the mobile experience is the best, and you'll use it on the go.";
  return "Because it's the easiest place to start. No setup, just ask.";
};
