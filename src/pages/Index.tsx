import { Link } from "react-router-dom";
import SiteLayout from "@/components/SiteLayout";

const primaryBtn =
  "inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-3 rounded-sm text-[15px] font-medium hover:bg-navy/90 transition-colors";
const outlineBtn =
  "inline-flex items-center justify-center border border-navy text-navy px-5 py-3 rounded-sm text-[15px] font-medium hover:bg-navy-light transition-colors";

const Index = () => {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-[760px] px-6">
        {/* Hero */}
        <section className="pt-24 pb-28 md:pt-32 md:pb-32">
          <h1 className="text-5xl md:text-6xl font-extrabold text-navy">
            Zach's AI Stack.
          </h1>
          <p className="mt-6 text-xl md:text-2xl font-normal text-navy leading-snug">
            A guide to every AI tool worth using, written for the people I care about.
          </p>
          <p className="mt-6 text-foreground/80">
            Free. Mine to keep updated. No course at the end.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link to="/stack#start-here" className={primaryBtn}>
              Start Here →
            </Link>
            <Link to="/stack#tools" className={outlineBtn}>
              Browse the 17 Tools →
            </Link>
          </div>
        </section>

        {/* What this is */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl">What this is</h2>
          <div className="mt-6 space-y-5 text-foreground/90 text-[17px] leading-[1.7]">
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
        </section>

        {/* The Process */}
        <section className="py-20">
          <h2 className="text-3xl md:text-4xl">The way I use AI</h2>
          <p className="mt-6 text-foreground/90 text-[17px] leading-[1.7]">
            The tools matter less than the loop. Here's the four-step process I
            use for almost everything:
          </p>
          <ol className="mt-8 space-y-5 list-none counter-reset-process">
            {[
              {
                lead: "Dump the messy version.",
                rest:
                  "Write the rough thinking somewhere — Notes, voice memo, anywhere. Don't try to sound smart yet.",
              },
              {
                lead: "Run it through ChatGPT.",
                rest:
                  "Ask it to turn the dump into a proper structured prompt for Claude.",
              },
              {
                lead: "Take it to Claude.",
                rest:
                  "Have the conversation. Push back. Ask for what's wrong with the answer. Argue.",
              },
              {
                lead: "Audit before acting.",
                rest:
                  "Ask Claude what's weak about its final answer. Most people skip this step. Don't.",
              },
            ].map((item, i) => (
              <li key={i} className="flex gap-5">
                <span className="text-navy font-bold tabular-nums w-6 shrink-0 pt-[2px]">
                  {i + 1}.
                </span>
                <p className="text-[17px] leading-[1.7] text-foreground/90">
                  <span className="font-semibold text-foreground">
                    {item.lead}
                  </span>{" "}
                  {item.rest}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-[14px]">
            <Link to="/stack#process" className="text-navy hover:underline">
              Read this in detail in 02 — The Process →
            </Link>
          </p>
        </section>

        {/* Chrome Consulting quiet line */}
        <section className="pt-20 pb-8">
          <hr className="border-border mb-16" />
          <h3 className="text-2xl text-navy">
            If you want help getting this set up properly
          </h3>
          <p className="mt-5 text-foreground/90 text-[17px] leading-[1.7]">
            Knowing the tools is one thing. Getting them properly set up around
            how you actually work is another. If you'd rather have someone do
            that for you, that's what I do for a living.
          </p>
          <div className="mt-8">
            <Link to="/work-with-me" className={outlineBtn}>
              Work with me →
            </Link>
          </div>
        </section>
      </article>
    </SiteLayout>
  );
};

export default Index;
