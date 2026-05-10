import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/", label: "Home" },
  { to: "/stack", label: "The Stack" },
  { to: "/work-with-me", label: "Work with me" },
];

const primaryBtn =
  "inline-flex items-center justify-center bg-navy text-primary-foreground px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";

const primaryBtnFull =
  "inline-flex w-full items-center justify-center bg-navy text-primary-foreground px-4 py-3 rounded-[8px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";

const SiteNav = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinkCls = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap transition-colors duration-200 ease-out hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm ${
      isActive ? "text-navy font-medium" : "text-foreground/65"
    }`;

  const closeAndGo = () => setSheetOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 bg-background/90 backdrop-blur transition-shadow duration-150 ${
        scrolled ? "border-b border-[hsl(var(--border))] shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-[1100px] px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-navy tracking-tight text-base whitespace-nowrap shrink-0">
          My AI Stack
        </Link>

        {/* Desktop */}
        <ul className="hidden md:flex items-center gap-5 sm:gap-7 text-[14px]">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.to === "/"} className={navLinkCls}>
                {l.label}
              </NavLink>
            </li>
          ))}
          {!loading && (
            <>
              {user ? (
                <>
                  <li>
                    <Link to="/dashboard" className={primaryBtn}>Dashboard</Link>
                  </li>
                  <li>
                    <button
                      onClick={async () => { await signOut(); navigate("/"); }}
                      className="whitespace-nowrap text-foreground/65 hover:text-navy transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
                    >
                      Sign out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <NavLink to="/login" className={navLinkCls}>Log in</NavLink>
                  </li>
                  <li>
                    <Link to="/signup" className={primaryBtn}>Sign up</Link>
                  </li>
                </>
              )}
            </>
          )}
        </ul>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="w-11 h-11 inline-flex items-center justify-center text-navy hover:bg-navy-light/40 rounded-[8px] transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-6 pt-12">
              <nav className="flex flex-col gap-1">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={closeAndGo}
                    className={({ isActive }) =>
                      `text-[16px] py-3 px-3 rounded-[8px] hover:bg-navy-light/40 transition-colors ${
                        isActive ? "text-navy font-medium bg-navy-light/30" : "text-navy"
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}

                <div className="my-6 h-px bg-[hsl(var(--border))]" />

                {!loading && (
                  <>
                    {user ? (
                      <>
                        <Link to="/dashboard" onClick={closeAndGo} className={primaryBtnFull}>
                          Dashboard
                        </Link>
                        <button
                          onClick={async () => { setSheetOpen(false); await signOut(); navigate("/"); }}
                          className="text-[16px] text-navy/60 hover:text-navy py-3 px-3 mt-1 text-left transition-colors"
                        >
                          Sign out
                        </button>
                      </>
                    ) : (
                      <>
                        <NavLink
                          to="/login"
                          onClick={closeAndGo}
                          className="text-[16px] text-navy py-3 px-3 rounded-[8px] hover:bg-navy-light/40 transition-colors"
                        >
                          Log in
                        </NavLink>
                        <Link to="/signup" onClick={closeAndGo} className={`${primaryBtnFull} mt-2`}>
                          Sign up
                        </Link>
                      </>
                    )}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default SiteNav;
