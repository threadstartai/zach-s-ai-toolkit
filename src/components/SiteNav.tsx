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

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur border-b border-border">
      <nav className="mx-auto max-w-[920px] px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-navy tracking-tight text-[15px]">
          My AI Stack
        </Link>
        <ul className="flex items-center gap-5 sm:gap-7 text-[14px]">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `transition-colors hover:text-navy ${
                    isActive ? "text-navy font-medium" : "text-foreground/70"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
          {!loading && (
            <>
              {user ? (
                <>
                  <li>
                    <Link to="/dashboard" className={primaryBtn}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={async () => { await signOut(); navigate("/"); }}
                      className="text-foreground/70 hover:text-navy transition-colors"
                    >
                      Sign out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <NavLink to="/login" className={({ isActive }) => `transition-colors hover:text-navy ${isActive ? "text-navy font-medium" : "text-foreground/70"}`}>
                      Log in
                    </NavLink>
                  </li>
                  <li>
                    <Link to="/signup" className={primaryBtn}>
                      Sign up
                    </Link>
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
