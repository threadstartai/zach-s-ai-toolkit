import { CATEGORIES, type CategoryData, type CategoryTool } from "../shared/categories";

const ToolCard = ({ tool }: { tool: CategoryTool }) => (
  <a
    href={`#tool-${tool.slug}`}
    onClick={(e) => e.preventDefault()}
    className="block bg-background border border-[hsl(var(--border))] rounded-[12px] p-5 hover:border-navy/40 transition-colors duration-150"
  >
    {tool.num && <div className="font-mono text-xs text-navy/60">{tool.num}</div>}
    <h4 className="text-lg font-bold text-navy mt-1">{tool.name}</h4>
    <p className="mt-2 text-sm text-foreground/80 leading-[1.6]">{tool.tagline}</p>
  </a>
);

const CategorySection = ({ data }: { data: CategoryData }) => (
  <section className="mt-14 first:mt-0">
    <h3 className="text-2xl font-bold text-navy">{data.title}</h3>
    <p className="mt-2 italic text-[14px] text-foreground/70">{data.blurb}</p>
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
      {data.tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
    </div>
  </section>
);

const AllTools = () => {
  return (
    <div>
      <h3 className="text-3xl font-bold text-navy tracking-[-0.02em]">All tools</h3>
      <p className="mt-3 italic text-[15px] text-foreground/70">
        Every tool, organised by where they fit in real life.
      </p>
      <div className="mt-10">
        {CATEGORIES.map((c) => <CategorySection key={c.title} data={c} />)}
      </div>
    </div>
  );
};

export default AllTools;
