import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/stack", label: "The Stack" },
  { to: "/work-with-me", label: "Work with me" },
];

const primaryBtn =
  "inline-flex items-center justify-center bg-navy text-primary-foreground px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium hover:bg-navy/90 transition-colors duration-150";

const SiteNav = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinkCls = ({ isActive }: { isActive: boolean }) =>
    `transition-colors duration-150 hover:text-navy ${
      isActive ? "text-navy font-medium" : "text-foreground/65"
    }`;

  return (
    <header
      className={`sticky top-0 z-50 bg-background/90 backdrop-blur transition-shadow duration-150 ${
        scrolled ? "border-b border-[hsl(var(--border))] shadow-[0_1px_0_rgba(26,58,92,0.04)]" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-[1100px] px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-navy tracking-tight text-[15px]">
          My AI Stack
        </Link>
        <ul className="flex items-center gap-5 sm:gap-7 text-[14px]">
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
                      className="text-foreground/65 hover:text-navy transition-colors duration-150"
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
      </nav>
    </header>
  );
};

export default SiteNav;
