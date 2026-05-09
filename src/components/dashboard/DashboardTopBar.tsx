import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const DashboardTopBar = () => {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const display = user?.user_metadata?.display_name || user?.email || "You";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-background border-b border-[hsl(var(--border))] transition-shadow duration-150 ${
        scrolled ? "shadow-[0_1px_0_rgba(26,58,92,0.04)]" : ""
      }`}
    >
      <div className="px-5 sm:px-8 py-3.5 flex items-center justify-between">
        <Link to="/dashboard" className="font-bold text-navy tracking-tight text-[15px]">
          My AI Stack
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-foreground/65 hidden sm:inline truncate max-w-[200px]">
            {display}
          </span>
          <button
            onClick={() => { void signOut(); window.location.assign("/"); }}
            className="text-[13px] text-navy/75 hover:text-navy hover:underline transition-colors duration-150"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopBar;
