import SiteLayout from "@/components/SiteLayout";

const PILLARS = [
  {
    title: "What I do",
    body: "Done-with-you AI setup for individuals, founders, and small teams. Tooling, workflow integration, prompt patterns.",
  },
  {
    title: "Who I work with",
    body: "Non-technical operators who want AI working in their daily flow without becoming a prompt engineer.",
  },
  {
    title: "How it works",
    body: "We talk through your work. I set up the right tools. We review what's actually used.",
  },
];

const WorkWithMe = () => {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-[900px] px-6">
        {/* Hero */}
        <section className="pt-16 md:pt-20 pb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-navy tracking-[-0.02em] leading-[1.05]">
            Work with me
          </h1>
          <p className="mt-5 text-xl md:text-2xl font-normal text-foreground/70 leading-snug max-w-[620px]">
            If you'd rather have someone do this properly.
          </p>
        </section>

        {/* Body */}
        <section className="pb-12">
          <p className="max-w-[680px] text-foreground/85 text-[16.5px] leading-[1.7]">
            Knowing the tools is one thing. Getting them properly set up around how you actually work is another. If you'd rather have someone do that for you, that's what I do for a living.
          </p>
        </section>

        {/* Pillars */}
        <section className="pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PILLARS.map((p) => (
              <div key={p.title} className="bg-background border border-[hsl(var(--border))] rounded-[12px] p-6">
                <h3 className="text-[17px] font-bold text-navy">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-[1.65] text-foreground/85">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="border-t border-[hsl(var(--border))] pt-12 mt-16 pb-20">
          <p className="text-[16px] leading-[1.7] text-foreground/85">
            Drop me a line:{" "}
            <a href="mailto:zach@chromeconsulting.xyz" className="text-navy underline underline-offset-4 hover:text-navy/80">
              zach@chromeconsulting.xyz
            </a>{" "}
            |{" "}
            <a
              href="https://instagram.com/chrome.zach"
              className="text-navy underline underline-offset-4 hover:text-navy/80"
            >
              @chrome.zach (Instagram)
            </a>
          </p>
        </section>
      </article>
    </SiteLayout>
  );
};

export default WorkWithMe;
