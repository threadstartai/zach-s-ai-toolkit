import { Link } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES as SHARED_CATEGORIES } from "@/pages/result/shared/categories";

const primaryBtn =
  "inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-3 rounded-[8px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";
const outlineBtn =
  "inline-flex items-center justify-center border border-navy text-navy px-5 py-3 rounded-[8px] text-[15px] font-medium hover:bg-navy-light transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";

const sectionLabelCls = "font-mono text-[11px] tracking-[0.12em] uppercase text-navy mb-3";

const STACK_CATEGORIES = SHARED_CATEGORIES
  .filter((c) => c.title !== "Foundationals")
  .map((c, i) => ({
    num: `0${i + 1}`,
    name: c.title,
    tools: c.tools.filter((t) => Boolean(t.num)),
  }));

const processCardCls =
  "bg-background border border-[hsl(var(--border))] rounded-[12px] p-5 md:p-6 hover:border-navy/40 transition-colors duration-200 ease-out";

const PROCESS = [
  {
    lead: "Dump the messy version.",
    rest: "Write the rough thinking somewhere — Notes, voice memo, anywhere. Don't try to sound smart yet.",
  },
  {
    lead: "Run it through ChatGPT.",
    rest: "Ask it to turn the dump into a proper structured prompt for Claude.",
  },
  {
    lead: "Take it to Claude.",
    rest: "Have the conversation. Push back. Ask for what's wrong with the answer. Argue.",
  },
  {
    lead: "Audit before acting.",
    rest: "Ask Claude what's weak about its final answer. Most people skip this step. Don't.",
  },
];

const Index = () => {
  const { user } = useAuth();
  const startHref = user ? "/dashboard" : "/signup";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1100px] px-6">
        {/* Hero */}
        <section className="pt-10 md:pt-24 pb-10 md:pb-20">
          <div className="max-w-[760px]">
            <h1 className="text-[40px] md:text-6xl font-extrabold tracking-[-0.02em] leading-[1.05]">
              My AI Stack.
            </h1>
            <p className="mt-5 text-xl md:text-2xl font-normal text-navy leading-snug max-w-[600px]">
              A guide to every AI tool worth using, written for the people I care about.
            </p>
            <p className="mt-5 text-foreground/80">
              100% free. Made for friends and family — so nobody gets left behind by AI.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3">
              <Link to={startHref} className={`${primaryBtn} w-full sm:w-auto`}>
                Get my stack →
              </Link>
              <Link
                to="/stack"
                className="text-[14px] text-navy underline underline-offset-4 hover:opacity-80 transition-opacity duration-200 ease-out mt-1 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
              >
                Or browse all 17 tools →
              </Link>
            </div>
          </div>

          {/* Trust strip */}
          <p className="mt-6 md:mt-10 italic text-[14px] text-navy/70">
            17 AI tools. No affiliate links. No marketing. No upsells. Just what's worth using and how to use it.
          </p>
        </section>

        {/* What this is — single column */}
        <section className="py-10 md:py-20 border-t border-[hsl(var(--border))]">
          <div className={sectionLabelCls}>01 — What this is</div>
          <div className="max-w-[760px]">
            <h2 className="text-[26px] md:text-[28px] font-bold tracking-tight">What this is</h2>
            <div className="mt-5 space-y-4 text-foreground/85 text-[16.5px] leading-[1.7]">
              <p>
                17 AI tools, one place, written like a friend would explain them. No
                affiliate links. No sponsored placements. Just what's worth using
                right now and how to actually use it.
              </p>
              <p>
                Built around four ways AI shows up in real life: thinking, research,
                building, and daily life.
              </p>
            </div>
          </div>
        </section>

        {/* Inside the stack */}
        <section className="py-10 md:py-20 border-t border-[hsl(var(--border))]">
          <div className={sectionLabelCls}>02 — Inside</div>
          <h2 className="text-[26px] md:text-[28px] font-bold tracking-tight">17 tools, four ways AI shows up.</h2>
          <p className="mt-5 max-w-[680px] text-foreground/85 text-[16.5px] leading-[1.7]">
            Every tool I'd actually recommend, organised by where it fits in real life. Read the ones that match what you're doing. Skip the rest.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {STACK_CATEGORIES.map((cat) => (
              <div key={cat.name}>
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="font-mono text-[12px] text-navy/60 tabular-nums">{cat.num}</span>
                  <h3 className="text-[18px] font-bold tracking-tight">{cat.name}</h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {cat.tools.map((t) => (
                    <li
                      key={t.slug}
                      className="flex flex-col gap-1 border-t border-[hsl(var(--border))]/50 pt-3 first:border-t-0 first:pt-0"
                    >
                      <span className="text-[15px] font-semibold text-navy">{t.name}</span>
                      <span className="text-[14px] text-foreground/70 leading-[1.55]">{t.tagline}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-10 text-[14px]">
            <Link to="/stack" className="text-navy hover:underline">
              See all 17 with the full guides →
            </Link>
          </p>
        </section>

        {/* The Process — 2x2 grid */}
        <section className="py-10 md:py-20 border-t border-[hsl(var(--border))]">
          <div className={sectionLabelCls}>03 — How I use AI</div>
          <div className="max-w-[760px]">
            <h2 className="text-[26px] md:text-[28px] font-bold tracking-tight">The way I use AI</h2>
            <p className="mt-5 text-foreground/85 text-[16.5px] leading-[1.7]">
              The tools matter less than the loop. Here's the four-step process I use for almost everything:
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {PROCESS.map((item, i) => (
              <div key={i} className={processCardCls}>
                <span className="font-mono text-[12px] text-navy/60 tabular-nums">{`0${i + 1}.`}</span>
                <p className="mt-2 text-[16px] leading-[1.65] text-foreground/90">
                  <span className="font-semibold text-navy">{item.lead}</span> {item.rest}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[14px]">
            <Link to="/stack#process" className="text-navy hover:underline">
              Read this in detail in 02 — The Process →
            </Link>
          </p>
        </section>

        {/* Chrome Consulting */}
        <section className="py-10 md:py-20 border-t border-[hsl(var(--border))]">
          <div className={sectionLabelCls}>04 — If you want help</div>
          <div className="max-w-[760px]">
            <h3 className="text-2xl font-bold tracking-tight">
              If you want help getting this set up properly
            </h3>
            <p className="mt-5 text-foreground/85 text-[16.5px] leading-[1.7]">
              Knowing the tools is one thing. Getting them properly set up around how you actually work is another. If you'd rather have someone do that for you, that's what I do for a living.
            </p>
            <div className="mt-7">
              <Link to="/work-with-me" className={outlineBtn}>
                Work with me →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
};

export default Index;
