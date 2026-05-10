import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const SiteFooter = () => {
  const { user } = useAuth();
  return (
    <footer className="mt-16 md:mt-24 border-t border-[hsl(var(--border))] bg-background">
      <div className="mx-auto max-w-[1100px] px-6 py-10 md:py-12 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:gap-16 text-[14px] leading-relaxed text-foreground/75">
        <div className="max-w-[640px]">
          <p className="italic">
            Created by Zach Z. Made for friends &amp; family. If you know someone whose business or team would benefit from a proper AI setup, send them my way:{" "}
            <a href="mailto:zach@chromeconsulting.xyz" className="text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm">zach@chromeconsulting.xyz</a>{" "}
            <span className="text-foreground/40">|</span>{" "}
            <a href="https://instagram.com/chrome.zach" className="text-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm">@chrome.zach</a>{" "}
            <span className="not-italic text-foreground/55">(Instagram)</span>.
          </p>
          <p className="mt-5 text-[12px] text-foreground/55">
            No affiliate links. No sponsored placements. Updated regularly.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-col gap-2 text-[13px]">
            <li><Link to="/" className="hover:text-navy transition-colors">Home</Link></li>
            <li><Link to="/stack" className="hover:text-navy transition-colors">The Stack</Link></li>
            <li><Link to="/work-with-me" className="hover:text-navy transition-colors">Work with me</Link></li>
            {user ? (
              <li><Link to="/dashboard" className="hover:text-navy transition-colors">Dashboard</Link></li>
            ) : (
              <li><Link to="/login" className="hover:text-navy transition-colors">Log in</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default SiteFooter;
