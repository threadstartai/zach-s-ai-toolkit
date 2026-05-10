import { Link } from "react-router-dom";

const WorkWithZach = () => (
  <div>
    <h3 className="text-3xl font-bold tracking-[-0.02em]">Work with Zach</h3>
    <p className="mt-3 italic text-[15px] text-foreground/70">
      If you'd rather have someone do this properly.
    </p>
    <p className="mt-10 text-[16px] text-foreground/85 leading-[1.7]">
      Knowing the tools is one thing. Getting them properly set up around how you actually work is another. If you'd rather have someone do that for you, that's what I do for a living.
    </p>
    <div className="mt-7">
      <Link
        to="/work-with-me"
        className="inline-flex items-center justify-center border border-navy text-navy px-5 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-navy-light/40 transition-colors duration-150"
      >
        Read more →
      </Link>
    </div>
    <div className="mt-12 pt-8 border-t border-[hsl(var(--border))]">
      <p className="text-[14px] text-foreground/75">
        Quick contact:{" "}
        <a href="mailto:zach@chromeconsulting.xyz" className="text-navy underline underline-offset-2 hover:opacity-80">
          zach@chromeconsulting.xyz
        </a>
        {" · "}
        <a
          href="https://instagram.com/chrome.zach"
          target="_blank"
          rel="noopener noreferrer"
          className="text-navy underline underline-offset-2 hover:opacity-80"
        >
          @chrome.zach
        </a>{" "}
        (Instagram)
      </p>
    </div>
  </div>
);

export default WorkWithZach;
