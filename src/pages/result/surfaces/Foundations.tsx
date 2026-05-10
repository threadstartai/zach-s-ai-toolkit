const items = [
  { num: "00", title: "Start Here", desc: "Where to begin and what order to read." },
  { num: "01", title: "Why I Made This", desc: "The honest reason this exists." },
  { num: "02", title: "The Process", desc: "The four-step loop I use for almost everything." },
  { num: "03", title: "How This Was Built", desc: "Behind the scenes." },
  { num: "—", title: "The Master Prompt Guide", desc: "The prompt patterns worth memorising." },
  { num: "—", title: "Power-Ups", desc: "Small upgrades that make a big difference." },
  { num: "—", title: "Pass This On", desc: "Who this is for, and how to share it." },
  { num: "—", title: "Building Things — Overview", desc: "The whole landscape, in one place." },
];

const Foundations = () => (
  <div>
    <h3 className="text-3xl font-bold text-navy tracking-[-0.02em]">Foundations</h3>
    <p className="mt-3 italic text-[15px] text-foreground/70">
      The seven docs that make the rest of the Stack make sense.
    </p>
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((it) => (
        <div key={it.title} className="bg-background border border-[hsl(var(--border))] rounded-[12px] p-5">
          <div className="font-mono text-xs text-navy/60">{it.num}</div>
          <h4 className="mt-1 text-lg font-bold text-navy">{it.title}</h4>
          <p className="mt-2 text-sm text-foreground/70 leading-[1.6]">{it.desc}</p>
          <p className="mt-3 text-[12px] italic text-foreground/55">Coming soon.</p>
        </div>
      ))}
    </div>
  </div>
);

export default Foundations;
