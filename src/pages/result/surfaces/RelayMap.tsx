const LAYERS = [
  {
    code: "01 · CAPTURE",
    title: "Get the raw context in.",
    description:
      "The first move is always getting what's in your head — or in the room — out into something an AI can read. Don't optimise the format yet; just capture.",
    relays: [
      ["Granola", "Claude"],
      ["Wispr Flow", "Claude"],
      ["Browser tab", "Perplexity"],
    ],
    relayNotes: [
      "Granola captures the meeting. Claude turns it into action points.",
      "Wispr Flow dictates rough thinking. Claude shapes it into a brief.",
      "Perplexity grounds a question in real sources before you ask it elsewhere.",
    ],
  },
  {
    code: "02 · CLARIFY",
    title: "Sharpen what you actually want.",
    description:
      "Most weak AI output comes from weak briefs. Clarify means writing the question properly — context, job, constraints, output, follow-up. The Master Prompt Guide is the discipline.",
    relays: [
      ["Rough idea", "Brief in Claude", "Refined brief"],
      ["Captured notes", "Claude", "Structured ask"],
    ],
    relayNotes: [
      "Take the rough idea. Brief Claude properly. Use its follow-up questions to refine.",
      "Feed captured notes to Claude. Ask it to surface the actual question you should be asking.",
    ],
  },
  {
    code: "03 · COMPARE",
    title: "Same brief, different models.",
    description:
      "Don't trust any one model. Run your locked brief through two or three and notice what changes. The point isn't which wins — it's learning what each one is good at.",
    relays: [
      ["Locked brief", "Claude", "ChatGPT"],
      ["Research question", "Perplexity", "Claude"],
      ["Same brief", "Gemini", "Claude"],
    ],
    relayNotes: [
      "Claude tends to be more structured. ChatGPT is often more energetic. Notice which lands.",
      "Perplexity finds sources. Claude synthesises across them. Use both.",
      "Gemini reads long context well. Claude reasons carefully. The right tool depends on the job.",
    ],
  },
  {
    code: "04 · BUILD",
    title: "Turn the answer into something real.",
    description:
      "Output you can read isn't the goal. The goal is something that exists in the world — a doc, a site, a script, a working artefact. Build means moving from text to thing.",
    relays: [
      ["Brief", "Lovable", "Site"],
      ["Plan", "Manus", "Delivered task"],
      ["Spec", "Claude Code", "Working code"],
    ],
    relayNotes: [
      "Lovable turns a brief into a working web app. Don't skip the brief.",
      "Manus runs multi-step tasks end-to-end. Give it the plan, not the action list.",
      "Claude Code edits your repo directly. Best for real code changes, not greenfield.",
    ],
  },
  {
    code: "05 · RETAIN",
    title: "Save what worked.",
    description:
      "Most AI work disappears the moment the tab closes. Retain means putting the prompt, the answer, or the pattern somewhere you'll find again. Compounds over time.",
    relays: [
      ["Working prompt", "Saved chunks", "Reused later"],
      ["Distilled note", "Notes", "Searched later"],
      ["Repeated pattern", "Obsidian", "Personal system"],
    ],
    relayNotes: [
      "If a brief worked, save it in your stack. Future-you will need it.",
      "Notes (in this app) catches the half-formed thought. Summarise to lock it.",
      "Obsidian holds the long-term patterns. Send the keepers there.",
    ],
  },
];

const Relay = ({ chain }: { chain: string[] }) => (
  <div className="flex flex-wrap items-center gap-2">
    {chain.map((node, i) => (
      <div key={i} className="flex items-center gap-2">
        <span className="inline-flex items-center bg-navy-light/40 text-navy rounded-[6px] px-2.5 py-1 text-[13px] font-medium">
          {node}
        </span>
        {i < chain.length - 1 && (
          <span className="text-navy/50 text-[14px]" aria-hidden>→</span>
        )}
      </div>
    ))}
  </div>
);

const Layer = ({ layer }: { layer: typeof LAYERS[number] }) => (
  <section className="bg-card border border-[hsl(var(--border))] rounded-[12px] p-6 md:p-7">
    <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-navy">
      {layer.code}
    </p>
    <h2 className="mt-3 text-[22px] sm:text-[24px] font-bold text-foreground tracking-[-0.02em] leading-[1.2]">
      {layer.title}
    </h2>
    <p className="mt-3 text-[15px] text-foreground/80 leading-[1.65]">
      {layer.description}
    </p>

    <div className="mt-5 space-y-4">
      {layer.relays.map((chain, i) => (
        <div key={i}>
          <Relay chain={chain} />
          <p className="mt-2 text-[13px] text-foreground/65 leading-[1.55]">
            {layer.relayNotes[i]}
          </p>
        </div>
      ))}
    </div>
  </section>
);

const RelayMap = () => {
  return (
    <div className="max-w-[760px] mx-auto px-5 sm:px-8 py-8 md:py-10">
      <header className="mb-8">
        <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-navy">
          The system
        </p>
        <h1 className="mt-3 text-[32px] sm:text-[36px] font-bold text-foreground tracking-[-0.02em] leading-[1.15]">
          How the tools fit together.
        </h1>
        <p className="mt-3 text-[15px] text-foreground/75 leading-[1.65]">
          Five layers. Each layer has tools that do one thing well. The point isn't to use every tool — it's to know which layer you're in, and pass between them deliberately.
        </p>
      </header>

      <div className="space-y-6">
        {LAYERS.map((layer) => (
          <Layer key={layer.code} layer={layer} />
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-[hsl(var(--border))]/60">
        <p className="text-[13px] text-foreground/55 leading-[1.6]">
          This is a reference, not a checklist. Most real work moves between two adjacent layers — Capture and Clarify, Compare and Build. The layers are a way of noticing what move you're making, not a script to follow.
        </p>
      </div>
    </div>
  );
};

export default RelayMap;
