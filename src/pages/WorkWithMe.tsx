import SiteLayout from "@/components/SiteLayout";
import { Card } from "@/components/ui-primitives/Card";

const PILLARS = [
  {
    title: "What I do",
    body: "Set up your AI stack properly — the tools, the prompts, the workflows — around how you actually work. Not generic advice. Specific to you.",
  },
  {
    title: "Who I work with",
    body: "Founders, small teams, and individuals who want AI to do real work for them, but don't have time to figure out which 30 tools to ignore.",
  },
  {
    title: "How it works",
    body: "We start with a conversation about what you do and where you're stuck. I propose a setup. We build it together over a few sessions. You leave knowing how to keep it working.",
  },
];

const outlineBtn =
  "inline-flex items-center justify-center border border-navy text-navy px-5 py-3 rounded-[8px] text-[15px] font-medium hover:bg-navy-light transition-colors duration-150";

const WorkWithMe = () => {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-[1100px] px-6">
        {/* Hero */}
        <section className="pt-16 md:pt-24 pb-12">
          <div className="max-w-[760px]">
            <p className="text-[13px] uppercase tracking-wider text-navy/60 font-medium">Chrome Consulting</p>
            <h1 className="mt-3 text-5xl md:text-6xl font-extrabold text-navy tracking-[-0.02em] leading-[1.05]">
              Work with me.
            </h1>
            <p className="mt-5 text-xl md:text-2xl font-normal text-navy leading-snug max-w-[620px]">
              If you'd rather have someone set this up properly than figure it out yourself.
            </p>
          </div>
        </section>

        {/* Body */}
        <section className="py-12 border-t border-[hsl(var(--border))]/60">
          <div className="max-w-[760px] space-y-4 text-foreground/85 text-[16.5px] leading-[1.7]">
            <p>
              Knowing the tools is one thing. Getting them set up around how you actually work — your inputs, your outputs, the things that take up your week — is another.
            </p>
            <p>
              The Stack on this site is what I'd hand you if you were a friend. Chrome Consulting is what happens when you want me to actually sit with you and build the setup.
            </p>
          </div>
        </section>

        {/* Pillars */}
        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {PILLARS.map((p) => (
              <Card key={p.title} className="bg-navy-light/40">
                <h3 className="text-[17px] font-bold text-navy">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.65] text-foreground/85">{p.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="py-14 md:py-20 border-t border-[hsl(var(--border))]/60">
          <div className="max-w-[760px]">
            <h2 className="text-2xl md:text-3xl text-navy font-bold tracking-tight">
              Get in touch
            </h2>
            <p className="mt-5 text-foreground/85 text-[16.5px] leading-[1.7]">
              Email is best. Tell me what you do and what you're stuck on — I reply to everything.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 sm:items-center text-[15px]">
              <a href="mailto:zach@chromeconsulting.xyz" className={outlineBtn}>
                zach@chromeconsulting.xyz
              </a>
              <a
                href="https://instagram.com/chrome.zach"
                className="text-navy hover:underline"
              >
                @chrome.zach on Instagram
              </a>
            </div>
          </div>
        </section>
      </article>
    </SiteLayout>
  );
};

export default WorkWithMe;
