import { Link } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES, type CategoryData, type CategoryTool } from "@/pages/result/shared/categories";

const ToolCard = ({ tool }: { tool: CategoryTool }) => (
  <div className="bg-background border border-[hsl(var(--border))] rounded-[12px] p-5 hover:border-navy/40 transition-colors duration-150">
    {tool.num && <div className="font-mono text-xs text-navy/60">{tool.num}</div>}
    <h4 className="text-lg font-bold text-navy mt-1">{tool.name}</h4>
    <p className="mt-2 text-sm text-foreground/80 leading-[1.6]">{tool.tagline}</p>
  </div>
);

const CategorySection = ({ data }: { data: CategoryData }) => (
  <section className="mt-12 md:mt-16 first:mt-0 scroll-mt-20">
    <h3 className="text-2xl font-bold text-navy">{data.title}</h3>
    <p className="mt-2 italic text-[14px] text-foreground/70">{data.blurb}</p>
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      {data.tools.map((t) => <ToolCard key={t.slug} tool={t} />)}
    </div>
  </section>
);

const Stack = () => {
  const { user } = useAuth();
  const startHref = user ? "/onboarding" : "/signup";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1100px] px-6 pt-10 md:pt-16 pb-24">
        {/* Hero */}
        <header className="max-w-[760px]">
          <h1 className="text-[36px] sm:text-[52px] font-extrabold text-navy tracking-[-0.02em] leading-[1.05]">
            The Stack
          </h1>
          <p className="mt-4 text-[18px] text-navy/85 leading-snug">
            All 17 tools, organised by where they fit in real life.
          </p>
          <p className="mt-3 italic text-[14px] text-navy/70">
            No affiliate links. If I recommend something, it's because I'd tell my own family to use it.
          </p>
        </header>

        {/* Build my stack — banner */}
        <section className="mt-10">
          <div className="bg-navy-light/40 rounded-[12px] p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-[15px] text-navy">
              <span className="font-bold">Build my stack</span> — answer 4 questions, get 3 personalised tools.
            </p>
            <Link
              to={startHref}
              className="self-start sm:self-center inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-navy/90 transition-colors duration-150"
            >
              Start →
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section id="tools" className="mt-12 md:mt-16 scroll-mt-20">
          {CATEGORIES.map((c) => <CategorySection key={c.title} data={c} />)}
        </section>

        <p className="mt-20 text-[12px] text-center text-foreground/55">
          Last updated: May 2026.
        </p>

        {/* Hidden anchor targets preserved for legacy links */}
        <span id="start-here" className="sr-only" />
        <span id="process" className="sr-only" />
      </div>
    </SiteLayout>
  );
};

export default Stack;
