import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const DashboardTopBar = () => {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const display =
    (user?.user_metadata as { display_name?: string } | undefined)?.display_name ||
    user?.email ||
    "You";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 h-14 bg-background border-b border-[hsl(var(--border))] transition-shadow duration-150 ${
        scrolled ? "shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : ""
      }`}
    >
      <div className="h-full px-6 flex items-center justify-between">
        <Link to="/dashboard" className="text-base font-bold text-navy tracking-tight">
          My AI Stack
        </Link>
        <div className="flex items-center">
          <span className="text-sm text-navy hidden sm:inline truncate max-w-[200px]">
            {display}
          </span>
          <span className="text-sm text-navy/40 mx-2 hidden sm:inline">·</span>
          <button
            onClick={() => { void signOut(); window.location.assign("/"); }}
            className="text-sm text-navy/60 hover:text-navy hover:underline transition-colors duration-150 ml-3 sm:ml-0"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopBar;
